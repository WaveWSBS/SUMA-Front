"""Assignment analysis + AI comment helpers."""
from __future__ import annotations

import io
import json
import re
import uuid
from pathlib import Path
from typing import Dict, List, Optional

import PyPDF2
from fastapi import HTTPException
from openai import OpenAI

from ..config import settings
from .rag import TextbookRAG, load_quiz_from_pdf


class AssignmentAIService:
    """Orchestrates PDF extraction, OpenAI calls, tagging, and RAG checks."""

    def __init__(self) -> None:
        self._client: Optional[OpenAI] = None
        self._rag: Optional[TextbookRAG] = None
        self._quiz_texts: Optional[List[str]] = None

    # ------------------------------------------------------------------
    # OpenAI helpers
    # ------------------------------------------------------------------
    def _ensure_client(self) -> OpenAI:
        if self._client is None:
            if not settings.OPENAI_API_KEY:
                raise HTTPException(
                    status_code=500,
                    detail="OPENAI_API_KEY is not configured on the server.",
                )
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    def analyze_assignment(self, pdf_text: str) -> Dict:
        client = self._ensure_client()
        prompt = (
            "Please analyze the following assignment document and extract key information.\n"
            "Return a structured analysis in JSON format with the following fields:\n"
            "- difficulty: integer 1-10\n"
            "- content_summary: string\n"
            "- estimated_time: string (e.g. '2-3 hours')\n"
            "- challenges: list of strings\n"
            "- plan: list of step descriptions\n\n"
            f"Assignment content:\n{pdf_text}\n\n"
            "Respond with valid JSON only."
        )
        try:
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                temperature=0,
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as exc:  # pragma: no cover - network/SDK errors
            raise HTTPException(status_code=502, detail=f"OpenAI error: {exc}") from exc

        content = response.choices[0].message.content or ""
        data = self._coerce_json_response(content)
        return data

    def _coerce_json_response(self, content: str) -> Dict:
        payload = content.strip()
        if payload.startswith("```"):
            payload = re.sub(r"^```(json)?", "", payload, flags=re.IGNORECASE).strip()
            if payload.endswith("```"):
                payload = payload[:-3]
        try:
            data = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=502,
                detail="OpenAI returned a response that is not valid JSON.",
            ) from exc
        return data

    # ------------------------------------------------------------------
    # PDF helpers / tagging
    # ------------------------------------------------------------------
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in pdf_reader.pages:
                text += (page.extract_text() or "") + "\n"
            return text.strip()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {exc}") from exc

    @staticmethod
    def parse_time_to_hours(time_str: str) -> float:
        value = time_str.lower()
        numbers = re.findall(r"\d+\.?\d*", value)
        if not numbers:
            return 0.0
        get_avg = (
            (float(numbers[0]) + float(numbers[1])) / 2
            if len(numbers) > 1
            else float(numbers[0])
        )
        if "week" in value:
            return get_avg * 40
        if "day" in value:
            return get_avg * 8
        if "hour" in value:
            return get_avg
        if "minute" in value:
            return get_avg / 60
        return float(numbers[0])

    def generate_tags(self, analysis: Dict) -> List[str]:
        tags: List[str] = []
        estimated_time = analysis.get("estimated_time", "") or ""
        time_hours = self.parse_time_to_hours(estimated_time)
        if time_hours > 10:
            tags.append("Time Consuming")
        if 0 < time_hours < 2:
            tags.append("Quick Task")
        content_lower = (analysis.get("content_summary") or "").lower()
        test_keywords = [
            "test",
            "exam",
            "quiz",
            "assessment",
            "evaluation",
            "midterm",
            "final",
        ]
        if any(keyword in content_lower for keyword in test_keywords):
            tags.append("High Occurrence in tests")
        difficulty = analysis.get("difficulty") or 0
        if difficulty >= 7:
            tags.append("Practice Recommended")
        challenges = analysis.get("challenges") or []
        if difficulty >= 8 or (isinstance(challenges, list) and len(challenges) >= 4):
            tags.append("Complex")
        collaboration_keywords = [
            "group",
            "team",
            "collaboration",
            "partner",
            "together",
            "pair",
        ]
        if any(keyword in content_lower for keyword in collaboration_keywords):
            tags.append("Group Work Suggested")
        return tags

    # ------------------------------------------------------------------
    # RAG helpers
    # ------------------------------------------------------------------
    def _ensure_rag(self) -> TextbookRAG:
        if self._rag is None:
            self._rag = TextbookRAG(
                textbook_dir=settings.RAG_TEXTBOOK_DIR,
                persist_directory=settings.RAG_PERSIST_DIR,
                openai_api_key=settings.OPENAI_API_KEY or None,
            )
        return self._rag

    def _load_default_quiz_texts(self) -> List[str]:
        if self._quiz_texts is not None:
            return self._quiz_texts
        quiz_dir = Path(settings.RAG_QUIZ_DIR)
        texts: List[str] = []
        if quiz_dir.exists():
            for pdf_path in sorted(quiz_dir.glob("*.pdf")):
                name = pdf_path.name.lower()
                if "textbook" in name:
                    continue
                text = load_quiz_from_pdf(pdf_path)
                if text.strip():
                    texts.append(text)
        self._quiz_texts = texts
        return texts

    def check_high_occurrence(
        self, assignment_text: str, quiz_texts: Optional[List[str]] = None
    ) -> Optional[Dict]:
        if not assignment_text.strip():
            return None
        rag = self._ensure_rag()
        texts = quiz_texts if quiz_texts is not None else self._load_default_quiz_texts()
        texts = texts or None
        return rag.check_high_occurrence_in_tests(
            assignment_text,
            quiz_texts=texts,
        )

    def compose_ai_comment(self, analysis: Dict, rag_report: Optional[Dict]) -> str:
        parts: List[str] = []
        difficulty = analysis.get("difficulty")
        estimated_time = analysis.get("estimated_time")
        summary = analysis.get("content_summary")
        if difficulty is not None and estimated_time:
            parts.append(
                f"Difficulty {difficulty}/10. Estimated effort: {estimated_time}."
            )
        elif difficulty is not None:
            parts.append(f"Difficulty {difficulty}/10.")
        elif estimated_time:
            parts.append(f"Estimated effort: {estimated_time}.")
        if summary:
            parts.append(f"Focus: {summary}")
        challenges = analysis.get("challenges") or []
        if isinstance(challenges, list) and challenges:
            parts.append("Key challenges: " + ", ".join(challenges[:3]))
        plan = analysis.get("plan") or []
        if isinstance(plan, list) and plan:
            parts.append("Suggested plan: " + " → ".join(plan[:4]))
        if rag_report:
            coverage = rag_report.get("textbook_coverage", {})
            matches = coverage.get("matches_found")
            if matches is not None:
                parts.append(f"Textbook coverage matches: {matches} relevant sections.")
            if rag_report.get("quiz_similarity") is not None:
                similarity_pct = round(rag_report["quiz_similarity"] * 100)
                parts.append(f"Quiz overlap: {similarity_pct}% of quizzes touch related topics.")
            if rag_report.get("is_high_occurrence"):
                parts.append("☑ Frequently appears in quizzes/exams. Prioritize review.")
        return " \n".join(parts).strip()

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------
    @staticmethod
    def generate_task_id(value: Optional[str] = None) -> str:
        return value or str(uuid.uuid4())

    def get_rag(self) -> TextbookRAG:
        return self._ensure_rag()


ai_service = AssignmentAIService()

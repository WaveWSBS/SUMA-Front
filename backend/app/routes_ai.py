from __future__ import annotations

import json
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .ai.analysis import ai_service
from .deps import get_db
from .models import AssignmentAnalysis
from .schemas import (
    AssignmentAnalysisOut,
    RagBuildRequest,
    RagCheckRequest,
    RagQueryRequest,
    RagSearchRequest,
)

router = APIRouter(prefix="/ai", tags=["ai"])


def _loads(value: Optional[str]) -> List[str]:
    if not value:
        return []
    try:
        data = json.loads(value)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def _load_dict(value: Optional[str]) -> Optional[dict]:
    if not value:
        return None
    try:
        data = json.loads(value)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        return None


def _to_schema(model: AssignmentAnalysis) -> AssignmentAnalysisOut:
    return AssignmentAnalysisOut(
        task_id=model.task_id,
        source_name=model.source_name,
        difficulty=model.difficulty,
        content_summary=model.content_summary,
        estimated_time=model.estimated_time,
        challenges=_loads(model.challenges),
        plan=_loads(model.plan),
        tags=_loads(model.tags),
        rag_summary=_load_dict(model.rag_summary),
        ai_comment=model.ai_comment,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


@router.post("/analyze", response_model=AssignmentAnalysisOut)
async def analyze_assignment(
    file: UploadFile = File(...),
    task_id: Optional[str] = Form(default=None),
    force_refresh: bool = Form(default=False),
    db: Session = Depends(get_db),
):
    resolved_task_id = ai_service.generate_task_id(task_id)
    existing = (
        db.query(AssignmentAnalysis)
        .filter(AssignmentAnalysis.task_id == resolved_task_id)
        .first()
    )
    if existing and not force_refresh:
        return _to_schema(existing)

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")
    pdf_text = ai_service.extract_text_from_pdf(pdf_bytes)
    if not pdf_text.strip():
        raise HTTPException(status_code=400, detail="Unable to extract text from PDF.")

    analysis_payload = ai_service.analyze_assignment(pdf_text)
    tags = ai_service.generate_tags(analysis_payload)
    rag_report = ai_service.check_high_occurrence(pdf_text)
    ai_comment = ai_service.compose_ai_comment(analysis_payload, rag_report)

    difficulty_value = analysis_payload.get("difficulty")
    try:
        difficulty = int(difficulty_value)
    except (TypeError, ValueError):
        difficulty = None

    raw_challenges = analysis_payload.get("challenges", [])
    if isinstance(raw_challenges, str):
        raw_challenges = [raw_challenges]
    raw_plan = analysis_payload.get("plan", [])
    if isinstance(raw_plan, str):
        raw_plan = [raw_plan]

    payload = dict(
        source_name=file.filename,
        difficulty=difficulty,
        content_summary=analysis_payload.get("content_summary"),
        estimated_time=analysis_payload.get("estimated_time"),
        challenges=json.dumps(raw_challenges),
        plan=json.dumps(raw_plan),
        tags=json.dumps(tags),
        rag_summary=json.dumps(rag_report or {}),
        ai_comment=ai_comment,
    )

    if existing:
        for key, value in payload.items():
            setattr(existing, key, value)
        record = existing
    else:
        record = AssignmentAnalysis(task_id=resolved_task_id, **payload)
        db.add(record)

    db.commit()
    db.refresh(record)
    return _to_schema(record)


@router.get("/analysis/{task_id}", response_model=AssignmentAnalysisOut)
async def get_analysis(task_id: str, db: Session = Depends(get_db)):
    record = (
        db.query(AssignmentAnalysis)
        .filter(AssignmentAnalysis.task_id == task_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_schema(record)


@router.get("/analyses", response_model=List[AssignmentAnalysisOut])
async def list_analyses(db: Session = Depends(get_db)):
    records = db.query(AssignmentAnalysis).order_by(AssignmentAnalysis.created_at.desc()).all()
    return [_to_schema(record) for record in records]


@router.post("/rag/build-vectorstore")
async def build_vectorstore(payload: RagBuildRequest):
    rag = ai_service.get_rag()
    rag.build_vectorstore(force_rebuild=payload.force_rebuild)
    return {"status": "ok"}


@router.post("/rag/query")
async def rag_query(payload: RagQueryRequest):
    rag = ai_service.get_rag()
    return rag.query(payload.question, openai_api_key=None)


@router.post("/rag/search")
async def rag_search(payload: RagSearchRequest):
    rag = ai_service.get_rag()
    return rag.search_similar_content(payload.query, k=payload.k)


@router.post("/rag/analyze-quiz")
async def rag_analyze_quiz(
    file: UploadFile = File(default=None),
    text: Optional[str] = Form(default=None),
):
    if file is None and not text:
        raise HTTPException(status_code=400, detail="Provide a quiz PDF or text content.")
    quiz_text = text or ""
    if file is not None:
        file_bytes = await file.read()
        quiz_text = ai_service.extract_text_from_pdf(file_bytes)
    rag = ai_service.get_rag()
    return rag.analyze_quiz(quiz_text)


@router.post("/rag/check-high-occurrence")
async def rag_check_high_occurrence(payload: RagCheckRequest):
    report = ai_service.check_high_occurrence(
        payload.assignment_text,
        quiz_texts=payload.quiz_texts,
    )
    if report is None:
        raise HTTPException(status_code=400, detail="Assignment text cannot be empty.")
    return report

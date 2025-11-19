"""LangChain-based Retrieval-Augmented Generation helpers used across the backend."""
from __future__ import annotations

import glob
from pathlib import Path
from typing import Dict, List, Optional

import PyPDF2
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


class TextbookRAG:
    """Utility wrapper around LangChain + Chroma for textbook retrieval."""

    def __init__(
        self,
        *,
        textbook_dir: str | Path,
        persist_directory: str | Path,
        openai_api_key: Optional[str] = None,
    ) -> None:
        self.textbook_dir = Path(textbook_dir)
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        self.openai_api_key = openai_api_key

        self.embeddings = (
            OpenAIEmbeddings(openai_api_key=openai_api_key)
            if openai_api_key
            else OpenAIEmbeddings()
        )
        self.vectorstore: Optional[Chroma] = None
        self.qa_chain: Optional[RetrievalQA] = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=512,
            chunk_overlap=50,
            length_function=len,
        )

    def load_textbooks(self) -> List:
        pdf_files = glob.glob(str(self.textbook_dir / "*.pdf"))
        documents = []
        for pdf_file in pdf_files:
            loader = PyPDFLoader(pdf_file)
            current_docs = loader.load()
            for doc in current_docs:
                doc.metadata["source"] = Path(pdf_file).name
            documents.extend(current_docs)
        return documents

    def build_vectorstore(self, *, force_rebuild: bool = False) -> None:
        if not force_rebuild and self.persist_directory.exists() and any(
            self.persist_directory.glob("**/*")
        ):
            self.vectorstore = Chroma(
                persist_directory=str(self.persist_directory),
                embedding_function=self.embeddings,
            )
            return

        documents = self.load_textbooks()
        if not documents:
            raise ValueError("No textbook PDFs found for RAG setup.")

        chunks = self.text_splitter.split_documents(documents)
        self.vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=str(self.persist_directory),
        )

    def _ensure_vectorstore(self) -> None:
        if self.vectorstore is None:
            self.build_vectorstore(force_rebuild=False)

    def initialize_qa_chain(self, *, openai_api_key: Optional[str] = None) -> None:
        self._ensure_vectorstore()
        api_key = openai_api_key or self.openai_api_key
        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5},
        )
        prompt_template = (
            "Use the following pieces of context from the textbook to answer the question.\n"
            "If you don't know the answer, say you don't know.\n\n"
            "Context: {context}\n\nQuestion: {question}\n\nAnswer:"
        )
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"],
        )
        llm = (
            ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=api_key)
            if api_key
            else ChatOpenAI(model="gpt-4o-mini", temperature=0)
        )
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True,
        )

    def query(self, question: str, *, openai_api_key: Optional[str] = None) -> Dict:
        if self.qa_chain is None:
            self.initialize_qa_chain(openai_api_key=openai_api_key)
        result = self.qa_chain({"query": question})
        return {
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content[:200] + "...",
                    "source": doc.metadata.get("source", "unknown"),
                    "page": doc.metadata.get("page", "unknown"),
                }
                for doc in result["source_documents"]
            ],
        }

    def search_similar_content(self, query: str, *, k: int = 5) -> List[Dict]:
        self._ensure_vectorstore()
        docs = self.vectorstore.similarity_search(query, k=k)
        return [
            {
                "content": doc.page_content,
                "source": doc.metadata.get("source", "unknown"),
                "page": doc.metadata.get("page", "unknown"),
            }
            for doc in docs
        ]

    def analyze_quiz(self, quiz_text: str) -> Dict:
        self._ensure_vectorstore()
        similar_content = self.search_similar_content(quiz_text, k=10)
        topics_found = len(similar_content) > 0
        coverage_score = (
            min(len(similar_content) / 10.0, 1.0) if similar_content else 0.0
        )
        return {
            "topics_found": topics_found,
            "coverage_score": coverage_score,
            "relevant_sections": similar_content[:5],
            "total_matches": len(similar_content),
        }

    def check_high_occurrence_in_tests(
        self, assignment_content: str, *, quiz_texts: Optional[List[str]] = None
    ) -> Dict:
        self._ensure_vectorstore()
        assignment_matches = self.search_similar_content(assignment_content, k=10)

        quiz_similarity = 0.0
        if quiz_texts:
            total_similarity = 0.0
            assignment_topics = set(assignment_content.lower().split())
            for quiz_text in quiz_texts:
                quiz_matches = self.search_similar_content(quiz_text, k=5)
                for match in quiz_matches:
                    match_words = set(match["content"].lower().split())
                    if assignment_topics.intersection(match_words):
                        total_similarity += 1.0
                        break
            quiz_similarity = total_similarity / len(quiz_texts)

        has_textbook_coverage = len(assignment_matches) >= 5
        is_high_occurrence = (
            has_textbook_coverage and quiz_similarity > 0.5
            if quiz_texts
            else has_textbook_coverage
        )

        return {
            "is_high_occurrence": is_high_occurrence,
            "textbook_coverage": {
                "matches_found": len(assignment_matches),
                "relevant_sections": assignment_matches[:5],
            },
            "quiz_similarity": quiz_similarity if quiz_texts else None,
            "confidence": min(len(assignment_matches) / 10.0, 1.0),
        }


def load_quiz_from_pdf(pdf_path: str | Path) -> str:
    path = Path(pdf_path)
    if not path.exists():
        return ""
    try:
        with path.open("rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
            return text
    except Exception as exc:  # pragma: no cover - best effort helper
        print(f"Error loading quiz PDF {path}: {exc}")
        return ""

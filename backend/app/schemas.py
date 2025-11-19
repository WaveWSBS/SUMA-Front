from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, EmailStr


class RegisterIn(BaseModel):
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: EmailStr


class AssignmentAnalysisOut(BaseModel):
    task_id: str
    source_name: Optional[str]
    difficulty: Optional[int]
    content_summary: Optional[str]
    estimated_time: Optional[str]
    challenges: List[str]
    plan: List[str]
    tags: List[str]
    rag_summary: Optional[Dict]
    ai_comment: Optional[str]
    created_at: datetime
    updated_at: datetime


class RagBuildRequest(BaseModel):
    force_rebuild: bool = False


class RagQueryRequest(BaseModel):
    question: str


class RagSearchRequest(BaseModel):
    query: str
    k: int = 5


class RagCheckRequest(BaseModel):
    assignment_text: str
    quiz_texts: Optional[List[str]] = None

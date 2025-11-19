from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func
import uuid
from .db import Base

# 在 SQLite 中沒有 UUID 類型，這裡使用 TEXT 保存 UUID 字串
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AssignmentAnalysis(Base):
    __tablename__ = "assignment_analyses"

    task_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_name = Column(String, nullable=True)
    difficulty = Column(Integer, nullable=True)
    content_summary = Column(Text, nullable=True)
    estimated_time = Column(String, nullable=True)
    challenges = Column(Text, nullable=True)
    plan = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)
    rag_summary = Column(Text, nullable=True)
    ai_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

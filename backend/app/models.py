from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
import uuid
from sqlalchemy.dialects.sqlite import BLOB
from .db import Base

# 在 SQLite 中沒有 UUID 類型，這裡使用 TEXT 保存 UUID 字串
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

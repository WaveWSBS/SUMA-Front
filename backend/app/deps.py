"""Common FastAPI dependencies."""
from __future__ import annotations

from typing import Generator

from .db import SessionLocal


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

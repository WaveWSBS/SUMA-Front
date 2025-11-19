from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


def _parse_origins(value: str) -> List[str]:
    return [v.strip() for v in value.split(',') if v.strip()]


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_RAG_DIR = BASE_DIR / "SUMABackend" / "RAG_textbook"


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./suma.db"
    JWT_SECRET: str = "IWANNAKILLMYSELF"  # 請在生產環境改為高強度隨機字串
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = _parse_origins(os.getenv("CORS_ORIGINS", "http://localhost:3000"))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    RAG_TEXTBOOK_DIR: str = os.getenv("RAG_TEXTBOOK_DIR", str(DEFAULT_RAG_DIR))
    RAG_PERSIST_DIR: str = os.getenv("RAG_PERSIST_DIR", str(DEFAULT_RAG_DIR / "chroma_db"))
    RAG_QUIZ_DIR: str = os.getenv("RAG_QUIZ_DIR", str(DEFAULT_RAG_DIR))


settings = Settings()

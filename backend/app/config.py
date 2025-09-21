from pydantic_settings import BaseSettings
from typing import List
import os


def _parse_origins(value: str) -> List[str]:
    return [v.strip() for v in value.split(',') if v.strip()]


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./suma.db"
    JWT_SECRET: str = "IWANNAKILLMYSELF"  # 請在生產環境改為高強度隨機字串
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = _parse_origins(os.getenv("CORS_ORIGINS", "http://localhost:3000"))


settings = Settings()
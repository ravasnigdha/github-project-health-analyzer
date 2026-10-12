import os
from typing import List
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

class Settings:
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "").strip()
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "900"))
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")
        if origin.strip()
    ]
    APP_VERSION: str = "1.0.0"
    SCORING_VERSION: str = "v1.0-deterministic"

settings = Settings()

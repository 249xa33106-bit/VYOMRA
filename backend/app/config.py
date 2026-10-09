import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from backend root or parent
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_host: str = os.getenv("API_HOST", "127.0.0.1")
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]
    
    # Intelligence Keys
    google_safe_browsing_api_key: str = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
    virustotal_api_key: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    
    # AI Story Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Security Constraints
    allow_active_redirect_fetching: bool = os.getenv("ALLOW_ACTIVE_REDIRECT_FETCHING", "true").lower() in ("true", "1", "yes")
    redirect_timeout_seconds: float = float(os.getenv("REDIRECT_TIMEOUT_SECONDS", "4.0"))
    max_redirect_hops: int = int(os.getenv("MAX_REDIRECT_HOPS", "5"))
    max_response_bytes: int = int(os.getenv("MAX_RESPONSE_BYTES", "1048576"))
    
    # Storage
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./phantom_x.db")
    
    # Versioning
    rule_engine_version: str = "v1.4.2-deterministic"

settings = Settings()

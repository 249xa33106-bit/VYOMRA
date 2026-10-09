import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

import uvicorn
from app.config import settings

def main():
    print("=" * 70)
    print("PHANTOM X — Autonomous Threat Investigation & Predictive Phishing Defense")
    print("=" * 70)
    print(f"[*] Engine Version: {settings.rule_engine_version}")
    print(f"[*] Local Server:   http://{settings.api_host}:{settings.api_port}")
    print(f"[*] API Swagger UI: http://{settings.api_host}:{settings.api_port}/docs")
    print(f"[*] Database:       {settings.database_url}")
    print("=" * 70)
    print("Launching server. Press Ctrl+C to terminate...")
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False
    )

if __name__ == "__main__":
    main()

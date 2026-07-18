# app/config.py
import os


def _normalize_db_url(url):
    """Some providers (Heroku, older Render URLs) hand out 'postgres://',
    but SQLAlchemy 1.4+ requires 'postgresql://'."""
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SQLALCHEMY_DATABASE_URI = _normalize_db_url(os.getenv("DATABASE_URL"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- JWT / session config ---
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ACCESS_EXPIRES_SECONDS = int(os.getenv("JWT_ACCESS_EXPIRES_SECONDS", "900"))  # 15 min
    REFRESH_EXPIRES_DAYS = int(os.getenv("REFRESH_EXPIRES_DAYS", "30"))

    # --- CORS ---
    # Comma-separated list in .env for multiple origins, e.g.
    # CORS_ALLOWED_ORIGINS=http://localhost:5173,https://safehaven.app
    CORS_ALLOWED_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]

    # --- Refresh cookie config ---
    REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "refresh_token")
    # Default False so local dev over plain http works. Set COOKIE_SECURE=true
    # in your production .env once you're serving over https.
    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

    if not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET is not set. Add it to your .env file, e.g. "
            "JWT_SECRET=$(python -c \"import secrets; print(secrets.token_hex(32))\")"
        )
import os


def _normalize_db_url(url):
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url

class Config:
    SQLALCHEMY_DATABASE_URI = _normalize_db_url(os.getenv("DATABASE_URL"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Logging 
    # DEBUG / INFO / WARNING / ERROR. Bump to DEBUG locally when chasing a bug.
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    # Pretty console output locally; set LOG_JSON=true in production so logs
    # come out as one JSON object per line, ready for a log aggregator.
    LOG_JSON = os.getenv("LOG_JSON", "false").lower() == "true"

    # JWT / session config 
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ACCESS_EXPIRES_SECONDS = int(os.getenv("JWT_ACCESS_EXPIRES_SECONDS", "900"))  # 15 min
    REFRESH_EXPIRES_DAYS = int(os.getenv("REFRESH_EXPIRES_DAYS", "30"))

    #  CORS 
    _cors_raw = os.getenv("CORS_ALLOWED_ORIGINS") or os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    CORS_ALLOWED_ORIGINS = [
        origin.strip() for origin in _cors_raw.split(",") if origin.strip()
    ]

    #  Refresh cookie config 
    REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "refresh_token")
    # Default False so local dev over plain http works. Set COOKIE_SECURE=true
    # in your production .env once you're serving over https.
    COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

    #  M-Pesa (Daraja) 
    # MPESA_BASE_URL points at Safaricom's sandbox or production host —
    # swap the whole URL rather than toggling an env flag, since sandbox and
    # production are genuinely different hosts with different behavior.
    MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
    MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
    MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
    MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
    MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
    MPESA_TRANSACTION_TYPE = os.getenv("MPESA_TRANSACTION_TYPE", "CustomerPayBillOnline")
    # Must be a publicly reachable HTTPS URL — Safaricom POSTs the STK push
    # result here asynchronously. In local dev this is an ngrok tunnel; the
    # path here (/api/payments/mpesa/callback) must match the route in
    # app/payments.py exactly.
    MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")

    if not all([MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL]):
        raise RuntimeError(
            "M-Pesa is not fully configured. Set MPESA_CONSUMER_KEY, "
            "MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, and "
            "MPESA_CALLBACK_URL in your .env — get these from your app on "
            "https://developer.safaricom.co.ke."
        )

    if not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET is not set. Add it to your .env file, e.g. "
            "JWT_SECRET=$(python -c \"import secrets; print(secrets.token_hex(32))\")"
        )
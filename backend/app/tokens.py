import uuid
from datetime import datetime, timedelta, timezone

import jwt
from flask import current_app

# In-memory set of currently-valid refresh token ids ("jti").

_valid_refresh_jtis = set()


def issue_access_token(user_id):
    expires_in = current_app.config["JWT_ACCESS_EXPIRES_SECONDS"]
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")
    return token, expires_in


def issue_refresh_token(user_id):
    days = current_app.config["REFRESH_EXPIRES_DAYS"]
    now = datetime.now(timezone.utc)
    jti = str(uuid.uuid4())
    payload = {
        "sub": user_id,
        "type": "refresh",
        "jti": jti,
        "iat": now,
        "exp": now + timedelta(days=days),
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")
    _valid_refresh_jtis.add(jti)
    return token


def revoke_refresh_token(token):
    """Best-effort revoke — used on logout."""
    try:
        payload = jwt.decode(
            token, current_app.config["JWT_SECRET"], algorithms=["HS256"]
        )
        _valid_refresh_jtis.discard(payload.get("jti"))
    except jwt.PyJWTError:
        pass


def decode_access_token(token):
    """Returns payload dict or raises jwt.PyJWTError."""
    payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Not an access token")
    return payload


def decode_refresh_token(token):
    """Returns payload dict, validated against the revocation set."""
    payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
    if payload.get("type") != "refresh":
        raise jwt.InvalidTokenError("Not a refresh token")
    if payload.get("jti") not in _valid_refresh_jtis:
        raise jwt.InvalidTokenError("Refresh token has been revoked")
    return payload
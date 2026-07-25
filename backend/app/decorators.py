from functools import wraps

import jwt
from flask import request, jsonify, g

from .tokens import decode_access_token
from .store import get_user_by_id


def require_auth(fn):

    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Missing or malformed Authorization header"}), 401

        token = header.removeprefix("Bearer ").strip()
        try:
            payload = decode_access_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Access token expired"}), 401
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid access token"}), 401

        user = get_user_by_id(payload["sub"])
        if not user:
            return jsonify({"error": "User not found"}), 401

        g.user = user
        return fn(*args, **kwargs)

    return wrapper


def optional_auth(fn):
    """Like require_auth, but never blocks the request. If a valid Bearer
    token is present, g.user is set; otherwise g.user is None. Used by
    routes that work for both logged-in and anonymous callers, e.g.
    donations."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        g.user = None
        if header.startswith("Bearer "):
            token = header.removeprefix("Bearer ").strip()
            try:
                payload = decode_access_token(token)
                g.user = get_user_by_id(payload["sub"])
            except jwt.PyJWTError:
                g.user = None
        return fn(*args, **kwargs)

    return wrapper
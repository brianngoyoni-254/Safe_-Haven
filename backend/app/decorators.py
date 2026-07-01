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
from flask import Blueprint, jsonify, g

from .decorators import require_auth
from .store import public_user

users_bp = Blueprint("users", __name__)


@users_bp.get("/me")
@require_auth
def me():
    return jsonify(public_user(g.user))
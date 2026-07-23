from flask import Blueprint, jsonify

from .store import (
    list_crisis_emergency_lines,
    public_crisis_emergency_line,
    list_crisis_categories,
    public_crisis_category,
)

crisis_bp = Blueprint("crisis", __name__)


# GET /api/crisis — matches crisisApi.list() on the frontend. Replaces the
# static EMERGENCY_LINES / SUPPORT_CATEGORIES arrays that previously lived
# in Crisis.jsx. Deliberately NOT behind @require_auth: someone in crisis
# may not be logged in (or able to log in), and this content must stay
# reachable regardless.
@crisis_bp.get("")
def list_crisis():
    return jsonify({
        "emergencyLines": [public_crisis_emergency_line(l) for l in list_crisis_emergency_lines()],
        "categories": [public_crisis_category(c) for c in list_crisis_categories()],
    })
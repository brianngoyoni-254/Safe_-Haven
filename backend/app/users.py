from datetime import date, datetime

from flask import Blueprint, jsonify, g, request

from .decorators import require_auth
from .store import public_user, set_sobriety_start, update_profile

users_bp = Blueprint("users", __name__)


@users_bp.get("/me")
@require_auth
def me():
    return jsonify(public_user(g.user))


# PUT /api/users/me/sobriety-start — sets the recovery start date Milestones.jsx
# tracks sober-days against. Reuses the existing sobriety_start column on User
# rather than a separate table, since it's a single value per user.
@users_bp.put("/me/sobriety-start")
@require_auth
def update_sobriety_start():
    data = request.get_json(silent=True) or {}
    raw_date = data.get("recoveryStartDate")

    try:
        parsed = datetime.strptime(raw_date, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return jsonify({"error": "recoveryStartDate must be an ISO date (YYYY-MM-DD)"}), 400

    if parsed > date.today():
        return jsonify({"error": "recoveryStartDate cannot be in the future"}), 400

    set_sobriety_start(g.user, parsed)
    return jsonify(public_user(g.user))


# PUT /api/users/me/profile — matches Profile.jsx's handleSave(), which
# currently only updates the in-memory auth user via updateUser(). Updates
# username, sobriety_start, and goals together in one call.
@users_bp.put("/me/profile")
@require_auth
def update_profile_route():
    data = request.get_json(silent=True) or {}

    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"error": "username is required"}), 400

    raw_date = data.get("sobrietyStart")
    sobriety_start = None
    if raw_date:
        try:
            sobriety_start = datetime.strptime(raw_date, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            return jsonify({"error": "sobrietyStart must be an ISO date (YYYY-MM-DD)"}), 400
        if sobriety_start > date.today():
            return jsonify({"error": "sobrietyStart cannot be in the future"}), 400

    goals = data.get("goals")
    goals = goals.strip() if isinstance(goals, str) else None

    user = update_profile(g.user, username=username, sobriety_start=sobriety_start, goals=goals)
    return jsonify(public_user(user))
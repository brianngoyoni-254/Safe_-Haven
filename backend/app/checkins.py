from datetime import datetime, timezone

from flask import Blueprint, request, jsonify, g

from .decorators import require_auth
from .store import get_checkin, upsert_checkin, get_checkin_history, public_checkin

checkins_bp = Blueprint("checkins", __name__)


def _today():
    """Server's current UTC date. Note: for us in Kenya (UTC+3) this can
    roll over a few hours later than our local midnight """
    return datetime.now(timezone.utc).date()


def _validate_payload(data):
    """Returns (cleaned_values, error_message). error_message is None on success."""
    mood = data.get("mood")
    craving_level = data.get("cravingLevel")
    sober_today = data.get("soberToday")
    notes = data.get("notes")

    if not isinstance(mood, int) or not (1 <= mood <= 5):
        return None, "mood must be an integer between 1 and 5"
    if not isinstance(craving_level, int) or not (1 <= craving_level <= 5):
        return None, "cravingLevel must be an integer between 1 and 5"
    if not isinstance(sober_today, bool):
        return None, "soberToday must be a boolean"
    if notes is not None and not isinstance(notes, str):
        return None, "notes must be a string"
    if isinstance(notes, str):
        notes = notes.strip() or None

    return {
        "mood": mood,
        "craving_level": craving_level,
        "sober_today": sober_today,
        "notes": notes,
    }, None


# GET /api/checkins/today — today's check-in, or null if not submitted yet
@checkins_bp.get("/today")
@require_auth
def today():
    checkin = get_checkin(g.user.id, _today())
    return jsonify(public_checkin(checkin) if checkin else None)


# GET /api/checkins — matches checkInApi.list() on the frontend; most recent
# first. Optional ?limit= (defaults to 30).
@checkins_bp.get("")
@require_auth
def list_checkins():
    limit = request.args.get("limit", default=30, type=int)
    checkins = get_checkin_history(g.user.id, limit=limit)
    return jsonify([public_checkin(c) for c in checkins])


# POST /api/checkins — matches checkInApi.create(); creates today's check-in,
# or overwrites it if one already exists (supports "Edit check-in" on the
# frontend, since there's only ever one row per user per day).
@checkins_bp.post("")
@require_auth
def create():
    data = request.get_json(silent=True) or {}
    cleaned, error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    checkin = upsert_checkin(g.user.id, _today(), **cleaned)
    return jsonify(public_checkin(checkin)), 200
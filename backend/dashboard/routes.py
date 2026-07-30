from datetime import date

from flask import Blueprint, jsonify, g

from .decorators import require_auth
from .services import (
    get_checkin,
    get_checkin_history,
    public_checkin,
    sync_earned_milestones,
    public_milestone,
    get_upcoming_group_session,
    MILESTONE_DAYS,
    CHECKIN_HISTORY_LIMIT,
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/")
@require_auth
def summary():
    user = g.user

    checkins = get_checkin_history(user.id, limit=CHECKIN_HISTORY_LIMIT)
    today_checkin = get_checkin(user.id, date.today())
    milestones = sync_earned_milestones(user.id, user.sobriety_start, MILESTONE_DAYS)
    upcoming_session = get_upcoming_group_session(user.id)

    return jsonify({
        "data": {
            "checkIns": [public_checkin(c) for c in checkins],
            "todayCheckIn": public_checkin(today_checkin) if today_checkin else None,
            "earnedMilestones": [public_milestone(m) for m in milestones],
            "upcomingSession": upcoming_session,
        }
    })
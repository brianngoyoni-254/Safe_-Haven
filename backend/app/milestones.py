from flask import Blueprint, jsonify, g

from .decorators import require_auth
from .store import sync_earned_milestones, public_milestone

milestones_bp = Blueprint("milestones", __name__)

# Keep in sync with MILESTONES in Milestones.jsx (the `days` values only —

MILESTONE_DAYS = [7, 30, 90, 180, 365]


# GET /api/milestones — earned badges only, oldest first. Each call syncs:
# any threshold newly crossed since the last check gets a Milestone row
# with a fixed achieved_at date, so the earned date won't shift later.
@milestones_bp.get("")
@require_auth
def list_milestones():
    earned = sync_earned_milestones(g.user.id, g.user.sobriety_start, MILESTONE_DAYS)
    return jsonify([public_milestone(m) for m in earned])
from flask import Blueprint, jsonify
from app.core.decorators import login_required
from app.milestones.models import Milestone
from app.extensions import db
from datetime import date, timedelta
import structlog

milestones_bp = Blueprint('milestones', __name__)
logger = structlog.get_logger(__name__)

MILESTONE_DAYS = [7, 30, 90, 180, 365, 730, 1000]

@milestones_bp.route('/', methods=['GET'])
@login_required
def get_milestones(current_user):
    """
    Get earned and upcoming recovery milestones
    ---
    tags:
      - Milestones
    security:
      - BearerAuth: []
    description: >
      Earned milestones are backfilled the first time this endpoint is hit
      after a threshold (7/30/90/180/365/730/1000 days) is crossed, based on
      the user's sobriety_start date.
    responses:
      200:
        description: Milestones the user has earned, plus upcoming ones with days remaining
        schema:
          type: object
          properties:
            success: { type: boolean }
            data:
              type: object
              properties:
                earned:
                  type: array
                  items: { type: object }
                upcoming:
                  type: array
                  items:
                    type: object
                    properties:
                      days: { type: integer }
                      days_until: { type: integer }
                      achieved: { type: boolean, example: false }
    """
    try:
        milestones = Milestone.query.filter_by(user_id=current_user.id).all()

        # Calculate upcoming milestones
        sobriety_start = current_user.sobriety_start
        today = date.today()

        upcoming = []
        earned_days = [m.days for m in milestones]

        if sobriety_start:
            days_sober = (today - sobriety_start).days
            for days in MILESTONE_DAYS:
                if days not in earned_days:
                    if days <= days_sober:
                        # Should have earned but isn't in DB - create it
                        milestone = Milestone(
                            user_id=current_user.id,
                            days=days,
                            achieved_at=sobriety_start + timedelta(days=days)
                        )
                        db.session.add(milestone)
                        db.session.commit()
                        logger.info(
                            "milestone_earned",
                            user_id=current_user.id,
                            days=days,
                        )
                    else:
                        days_until = days - days_sober
                        upcoming.append({
                            'days': days,
                            'days_until': days_until,
                            'achieved': False
                        })

        return jsonify({
            'success': True,
            'data': {
                'earned': [m.to_dict() for m in milestones],
                'upcoming': upcoming
            }
        }), 200
    except Exception as e:
        logger.error("get_milestones_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
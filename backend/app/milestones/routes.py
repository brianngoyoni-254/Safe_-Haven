from flask import Blueprint, jsonify
from app.core.decorators import login_required
from app.milestones.models import Milestone
from datetime import date, timedelta
import logging

milestones_bp = Blueprint('milestones', __name__)
logger = logging.getLogger(__name__)

MILESTONE_DAYS = [7, 30, 90, 180, 365, 730, 1000]

@milestones_bp.route('/', methods=['GET'])
@login_required
def get_milestones(current_user):
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
        logger.error(f'Get milestones error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
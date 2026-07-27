from flask import Blueprint, jsonify
from app.core.decorators import login_required
from app.checkins.models import CheckIn
from journal.models import JournalEntry
from app.milestones.models import Milestone
from groups.models import GroupMembership
from datetime import date, timedelta
from sqlalchemy import func
import logging

dashboard_bp = Blueprint('dashboard', __name__)
logger = logging.getLogger(__name__)

@dashboard_bp.route('/', methods=['GET'])
@login_required
def get_dashboard(current_user):
    try:
        today = date.today()
        week_ago = today - timedelta(days=7)
        
        # Check-ins
        checkin_today = CheckIn.query.filter_by(user_id=current_user.id, date=today).first()
        checkin_week = CheckIn.query.filter(
            CheckIn.user_id == current_user.id,
            CheckIn.date >= week_ago
        ).count()
        
        # Journal entries
        journal_count = JournalEntry.query.filter_by(user_id=current_user.id).count()
        journal_this_week = JournalEntry.query.filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.created_at >= week_ago
        ).count()
        
        # Milestones
        milestones = Milestone.query.filter_by(user_id=current_user.id).all()
        milestone_count = len(milestones)
        
        # Groups
        group_count = GroupMembership.query.filter_by(user_id=current_user.id).count()
        
        # Sobriety stats
        sobriety_days = 0
        if current_user.sobriety_start:
            sobriety_days = (today - current_user.sobriety_start).days
        
        return jsonify({
            'success': True,
            'data': {
                'checkin_today': checkin_today.to_dict() if checkin_today else None,
                'checkin_streak': checkin_week,
                'journal_count': journal_count,
                'journal_this_week': journal_this_week,
                'milestone_count': milestone_count,
                'group_count': group_count,
                'sobriety_days': sobriety_days,
                'sobriety_start': current_user.sobriety_start.isoformat() if current_user.sobriety_start else None,
            }
        }), 200
    except Exception as e:
        logger.error(f'Get dashboard error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
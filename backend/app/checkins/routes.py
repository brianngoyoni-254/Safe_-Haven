from flask import Blueprint, request, jsonify
from app.core.decorators import login_required
from app.checkins.services import checkin_service
from app.core.exceptions import AppError
import structlog

checkins_bp = Blueprint('checkins', __name__)
logger = structlog.get_logger(__name__)

@checkins_bp.route('/', methods=['POST'])
@login_required
def create_checkin(current_user):
    try:
        data = request.get_json()
        checkin = checkin_service.create_checkin(current_user.id, data)
        return jsonify({
            'success': True,
            'message': 'Check-in saved successfully',
            'data': checkin.to_dict()
        }), 201
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error("checkin_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@checkins_bp.route('/today', methods=['GET'])
@login_required
def get_today_checkin(current_user):
    try:
        checkin = checkin_service.get_today_checkin(current_user.id)
        return jsonify({
            'success': True,
            'data': checkin.to_dict() if checkin else None
        }), 200
    except Exception as e:
        logger.error("get_today_checkin_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@checkins_bp.route('/', methods=['GET'])
@login_required
def get_checkins(current_user):
    try:
        checkins = checkin_service.get_user_checkins(current_user.id)
        return jsonify({
            'success': True,
            'data': [c.to_dict() for c in checkins]
        }), 200
    except Exception as e:
        logger.error("get_checkins_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@checkins_bp.route('/stats', methods=['GET'])
@login_required
def get_stats(current_user):
    try:
        stats = checkin_service.get_stats(current_user.id)
        return jsonify({
            'success': True,
            'data': stats
        }), 200
    except Exception as e:
        logger.error("get_stats_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
from flask import Blueprint, jsonify
from crisis.models import CrisisEmergencyLine, CrisisCategory
from app.core.decorators import login_required
import structlog

crisis_bp = Blueprint('crisis', __name__)
logger = structlog.get_logger(__name__)

@crisis_bp.route('/', methods=['GET'])
@login_required
def get_crisis_data(current_user):
    try:
        emergency_lines = CrisisEmergencyLine.query.order_by(CrisisEmergencyLine.position).all()
        categories = CrisisCategory.query.order_by(CrisisCategory.position).all()

        return jsonify({
            'success': True,
            'data': {
                'emergency_lines': [e.to_dict() for e in emergency_lines],
                'categories': [c.to_dict() for c in categories]
            }
        }), 200
    except Exception as e:
        logger.error("get_crisis_data_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
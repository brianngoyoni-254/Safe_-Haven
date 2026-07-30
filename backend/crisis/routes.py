from flask import Blueprint, jsonify
from crisis.models import CrisisEmergencyLine, CrisisCategory
import structlog

crisis_bp = Blueprint('crisis', __name__)
logger = structlog.get_logger(__name__)

# Deliberately public — someone in crisis needs this page whether or not
# they're logged in, so this endpoint does NOT require auth.
@crisis_bp.route('/', methods=['GET'])
def get_crisis_data():
    """
    Get crisis support directory
    ---
    tags:
      - Crisis
    description: >
      Public endpoint, no auth required — this page needs to work for
      someone who isn't logged in. Returns flat emergency lines (police,
      ambulance) plus categorized support hotlines.
    responses:
      200:
        description: Emergency lines and hotline categories
        schema:
          type: object
          properties:
            success: { type: boolean }
            data:
              type: object
              properties:
                emergency_lines:
                  type: array
                  items: { type: object }
                categories:
                  type: array
                  items: { type: object }
    """
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
        logger.error("get_crisis_data_error", error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
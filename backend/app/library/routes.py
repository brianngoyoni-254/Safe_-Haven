from flask import Blueprint, jsonify
from app.library.models import LibraryTopic
from app.core.decorators import login_required
import logging

library_bp = Blueprint('library', __name__)
logger = logging.getLogger(__name__)

@library_bp.route('/', methods=['GET'])
@login_required
def get_topics(current_user):
    try:
        topics = LibraryTopic.query.order_by(LibraryTopic.position).all()
        return jsonify({
            'success': True,
            'data': [t.to_dict() for t in topics]
        }), 200
    except Exception as e:
        logger.error(f'Get library error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
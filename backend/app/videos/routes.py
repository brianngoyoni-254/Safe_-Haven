from flask import Blueprint, jsonify
from app.videos.models import VideoTopic
from app.core.decorators import login_required
import logging

videos_bp = Blueprint('videos', __name__)
logger = logging.getLogger(__name__)

@videos_bp.route('/', methods=['GET'])
@login_required
def get_topics(current_user):
    try:
        topics = VideoTopic.query.order_by(VideoTopic.position).all()
        return jsonify({
            'success': True,
            'data': [t.to_dict() for t in topics]
        }), 200
    except Exception as e:
        logger.error(f'Get videos error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
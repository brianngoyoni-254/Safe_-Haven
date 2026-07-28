from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
import logging

logger = logging.getLogger(__name__)

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            from app.users.models import User
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 401
            g.user = user
            return fn(*args, **kwargs)
        except Exception as e:
            logger.warning(f'Authentication failed: {str(e)}')
            return jsonify({'error': 'Authentication required'}), 401
    return wrapper

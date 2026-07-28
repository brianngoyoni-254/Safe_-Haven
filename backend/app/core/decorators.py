from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.extensions import db
import structlog

logger = structlog.get_logger(__name__)

def login_required(fn):
    """Decorator to require JWT authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            from app.users.models import User
            user = User.query.get(user_id)
            if not user:
                logger.warning("auth_user_not_found", user_id=user_id)
                return jsonify({'error': 'User not found'}), 401
            kwargs['current_user'] = user
            return fn(*args, **kwargs)
        except Exception as e:
            logger.warning("authentication_failed", error=str(e))
            return jsonify({'error': 'Authentication required'}), 401
    return wrapper

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    @login_required
    def wrapper(*args, **kwargs):
        user = kwargs.get('current_user')
        # Check if user is admin (add role field to User model)
        # For now, this is a placeholder
        return fn(*args, **kwargs)
    return wrapper

def rate_limit(limit=100, per=60):
    """Simple rate limiting decorator (in-memory)"""
    from collections import defaultdict
    import time

    requests = defaultdict(list)

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr
            now = time.time()
            window_start = now - per
            requests[ip] = [t for t in requests[ip] if t > window_start]

            if len(requests[ip]) >= limit:
                logger.warning("rate_limit_exceeded", ip=ip)
                return jsonify({'error': 'Rate limit exceeded'}), 429

            requests[ip].append(now)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
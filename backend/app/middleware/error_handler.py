from flask import jsonify
from app.extensions import db
from app.core.exceptions import AppError, ValidationError, NotFoundError, UnauthorizedError
import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    """Register custom error handlers"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'NotFoundError',
            'message': 'Resource not found'
        }), 404
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'error': 'BadRequestError',
            'message': str(error)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 'UnauthorizedError',
            'message': 'Authentication required'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'ForbiddenError',
            'message': 'Insufficient permissions'
        }), 403
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        logger.error(f'Internal server error: {str(error)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
    
    @app.errorhandler(AppError)
    def handle_app_error(error):
        logger.warning(f'Application error: {str(error)}')
        return jsonify({
            'success': False,
            'error': error.__class__.__name__,
            'message': str(error),
            'details': getattr(error, 'details', {})
        }), error.status_code
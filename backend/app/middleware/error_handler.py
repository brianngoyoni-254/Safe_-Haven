import structlog
from flask import request, jsonify
from app.core.exceptions import AppError

logger = structlog.get_logger(__name__)


def register_error_handlers(app):
    """Attach global JSON error handlers to the Flask app."""

    @app.errorhandler(AppError)
    def handle_app_error(error):
        logger.warning(
            'app_error',
            error_type=error.__class__.__name__,
            message=str(error),
            status_code=error.status_code,
            path=request.path,
        )
        return jsonify({
            'success': False,
            'error': error.__class__.__name__,
            'message': str(error),
            'details': getattr(error, 'details', {}),
        }), error.status_code

    @app.errorhandler(404)
    def handle_not_found(error):
        logger.info('not_found', path=request.path, method=request.method)
        return jsonify({
            'success': False,
            'error': 'NotFound',
            'message': 'The requested resource was not found',
        }), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        logger.info('method_not_allowed', path=request.path, method=request.method)
        return jsonify({
            'success': False,
            'error': 'MethodNotAllowed',
            'message': 'This method is not allowed for the requested URL',
        }), 405

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        logger.error(
            'unhandled_exception',
            error=str(error),
            error_type=error.__class__.__name__,
            path=request.path,
            exc_info=True,
        )
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred',
        }), 500
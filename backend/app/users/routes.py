from flask import Blueprint, request
from flask_restful import Resource, Api
from app.core.decorators import login_required
from app.users.services import user_service
from app.core.exceptions import AppError
import structlog

users_bp = Blueprint('users', __name__)
api = Api(users_bp)
logger = structlog.get_logger(__name__)


class UserProfileResource(Resource):
    method_decorators = [login_required]

    def get(self, current_user):
        """Get current user profile"""
        try:
            return {
                'success': True,
                'data': current_user.to_dict()
            }, 200
        except Exception as e:
            logger.error("get_profile_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def put(self, current_user):
        """Update current user profile"""
        try:
            data = request.get_json()
            user = user_service.update_user(current_user, data)
            return {
                'success': True,
                'message': 'Profile updated successfully',
                'data': user.to_dict()
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("update_profile_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


api.add_resource(UserProfileResource, '/me')
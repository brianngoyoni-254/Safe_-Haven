from flask import Blueprint, request
from flask_restful import Resource, Api
from app.core.decorators import login_required
from groups.services import group_service
from app.core.exceptions import AppError
import structlog

groups_bp = Blueprint('groups', __name__)
api = Api(groups_bp)
logger = structlog.get_logger(__name__)


class GroupListResource(Resource):
    method_decorators = [login_required]

    def post(self, current_user):
        try:
            data = request.get_json()
            group = group_service.create_group(current_user.id, data)
            return {
                'success': True,
                'message': 'Group created successfully',
                'data': group
            }, 201
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("create_group_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def get(self, current_user):
        try:
            groups = group_service.get_all_groups(current_user.id)
            return {
                'success': True,
                'data': groups
            }, 200
        except Exception as e:
            logger.error("get_groups_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class GroupCategoriesResource(Resource):
    method_decorators = [login_required]

    def get(self, current_user):
        try:
            categories = group_service.get_categories()
            return {
                'success': True,
                'data': categories
            }, 200
        except Exception as e:
            logger.error("get_categories_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class GroupResource(Resource):
    method_decorators = [login_required]

    def get(self, current_user, group_id):
        try:
            group = group_service.get_group(group_id, current_user.id)
            return {
                'success': True,
                'data': group
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("get_group_error", user_id=current_user.id, group_id=group_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def delete(self, current_user, group_id):
        try:
            group_service.delete_group(group_id, current_user.id)
            return {
                'success': True,
                'message': 'Group deleted successfully'
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("delete_group_error", user_id=current_user.id, group_id=group_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class GroupJoinResource(Resource):
    method_decorators = [login_required]

    def post(self, current_user, group_id):
        try:
            group = group_service.join_group(group_id, current_user.id)
            return {
                'success': True,
                'message': 'Joined group successfully',
                'data': group
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("join_group_error", user_id=current_user.id, group_id=group_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class GroupLeaveResource(Resource):
    method_decorators = [login_required]

    def post(self, current_user, group_id):
        try:
            group = group_service.leave_group(group_id, current_user.id)
            return {
                'success': True,
                'message': 'Left group successfully',
                'data': group
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("leave_group_error", user_id=current_user.id, group_id=group_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class GroupMessageListResource(Resource):
    method_decorators = [login_required]

    def post(self, current_user, group_id):
        try:
            data = request.get_json()
            message = group_service.send_message(group_id, current_user.id, data)
            return {
                'success': True,
                'message': 'Message sent',
                'data': message.to_dict()
            }, 201
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("send_message_error", user_id=current_user.id, group_id=group_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def get(self, current_user, group_id):
        try:
            limit = request.args.get('limit', 50, type=int)
            messages = group_service.get_messages(group_id, current_user.id, limit)
            return {
                'success': True,
                'data': [m.to_dict() for m in messages]
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("get_messages_error", user_id=current_user.id, group_id=group_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class GroupMessageResource(Resource):
    method_decorators = [login_required]

    def patch(self, current_user, group_id, message_id):
        try:
            data = request.get_json()
            message = group_service.edit_message(group_id, message_id, current_user.id, data)
            return {
                'success': True,
                'message': 'Message updated',
                'data': message.to_dict()
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("edit_message_error", user_id=current_user.id, group_id=group_id, message_id=message_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def delete(self, current_user, group_id, message_id):
        try:
            group_service.delete_message(group_id, message_id, current_user.id)
            return {
                'success': True,
                'message': 'Message deleted'
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("delete_message_error", user_id=current_user.id, group_id=group_id, message_id=message_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


api.add_resource(GroupListResource, '/')
api.add_resource(GroupCategoriesResource, '/categories')
api.add_resource(GroupResource, '/<group_id>')
api.add_resource(GroupJoinResource, '/<group_id>/join')
api.add_resource(GroupLeaveResource, '/<group_id>/leave')
api.add_resource(GroupMessageListResource, '/<group_id>/messages')
api.add_resource(GroupMessageResource, '/<group_id>/messages/<message_id>')
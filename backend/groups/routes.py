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
        """
        Create a support group
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: The creator is automatically added as a member (isMember=true) and becomes the organizer.
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required: [name, description, category]
              properties:
                name: { type: string, maxLength: 150 }
                description: { type: string }
                category:
                  type: string
                  description: "One of GET /api/groups/categories"
                isPrivate: { type: boolean, default: false }
                meetingSchedule: { type: string, nullable: true, example: "Tuesdays 6pm EAT" }
        responses:
          201:
            description: Group created
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          400:
            description: name, description, or category missing
        """
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
        """
        List all groups
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Each group includes `isMember` for the current user, so the frontend can show Join vs. Open.
        responses:
          200:
            description: All groups
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: array
                  items: { type: object }
        """
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
        """
        List available group categories
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Fixed list (e.g. "Substance Recovery", "Grief & Loss") used to populate the category dropdown when creating a group.
        responses:
          200:
            description: Category names
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: array
                  items: { type: string }
        """
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
        """
        Get a single group (with its messages)
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
        responses:
          200:
            description: Group detail, including its message history
            schema:
              type: object
              properties:
                success: { type: boolean }
                data: { type: object }
          404:
            description: Group not found
        """
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
        """
        Delete a group
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Organizer only.
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
        responses:
          200:
            description: Group deleted
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
          403:
            description: Caller is not the organizer
          404:
            description: Group not found
        """
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
        """
        Join a group
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
        responses:
          200:
            description: Joined successfully
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          400:
            description: Already a member
          403:
            description: Group is private
          404:
            description: Group not found
        """
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
        """
        Leave a group
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
        responses:
          200:
            description: Left successfully
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          404:
            description: Not a member of this group
        """
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
        """
        Send a message to a group
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Caller must be a member of the group.
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
          - in: body
            name: body
            required: true
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
        responses:
          201:
            description: Message sent
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          400:
            description: Message text missing
          403:
            description: Not a member of this group
          404:
            description: Group not found
        """
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
        """
        List messages in a group
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Returns the most recent `limit` messages in chronological order. Caller must be a member.
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
          - in: query
            name: limit
            type: integer
            default: 50
        responses:
          200:
            description: Messages, oldest first
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: array
                  items: { type: object }
          403:
            description: Not a member of this group
          404:
            description: Group not found
        """
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
        """
        Edit a group message
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Author only.
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
          - in: path
            name: message_id
            type: string
            required: true
          - in: body
            name: body
            required: true
            schema:
              type: object
              required: [text]
              properties:
                text: { type: string }
        responses:
          200:
            description: Message updated
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          400:
            description: Message text missing
          403:
            description: Not the message author
          404:
            description: Message not found
        """
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
        """
        Delete a group message
        ---
        tags:
          - Groups
        security:
          - BearerAuth: []
        description: Author or the group's organizer.
        parameters:
          - in: path
            name: group_id
            type: string
            required: true
          - in: path
            name: message_id
            type: string
            required: true
        responses:
          200:
            description: Message deleted
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
          403:
            description: Not the author or organizer
          404:
            description: Message not found
        """
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
from flask import Blueprint, request
from flask_restful import Resource, Api
from app.core.decorators import login_required
from journal.services import journal_service
from app.core.exceptions import AppError
import structlog

journal_bp = Blueprint('journal', __name__)
api = Api(journal_bp)
logger = structlog.get_logger(__name__)


class JournalListResource(Resource):
    method_decorators = [login_required]

    def post(self, current_user):
        try:
            data = request.get_json()
            entry = journal_service.create_entry(current_user.id, data)
            return {
                'success': True,
                'message': 'Journal entry created',
                'data': entry.to_dict()
            }, 201
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("create_journal_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def get(self, current_user):
        try:
            entries = journal_service.get_user_entries(current_user.id)
            return {
                'success': True,
                'data': [e.to_dict() for e in entries]
            }, 200
        except Exception as e:
            logger.error("get_journal_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class JournalResource(Resource):
    method_decorators = [login_required]

    def get(self, current_user, entry_id):
        try:
            entry = journal_service.get_entry(entry_id, current_user.id)
            return {'success': True, 'data': entry.to_dict()}, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("get_journal_entry_error", user_id=current_user.id, entry_id=entry_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def put(self, current_user, entry_id):
        try:
            data = request.get_json()
            entry = journal_service.update_entry(entry_id, current_user.id, data)
            return {
                'success': True,
                'message': 'Journal entry updated',
                'data': entry.to_dict()
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("update_journal_error", user_id=current_user.id, entry_id=entry_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def delete(self, current_user, entry_id):
        try:
            journal_service.delete_entry(entry_id, current_user.id)
            return {
                'success': True,
                'message': 'Journal entry deleted'
            }, 200
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("delete_journal_error", user_id=current_user.id, entry_id=entry_id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


api.add_resource(JournalListResource, '/')
api.add_resource(JournalResource, '/<entry_id>')
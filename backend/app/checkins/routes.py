from flask import Blueprint, request
from flask_restful import Resource, Api
from app.core.decorators import login_required
from app.checkins.services import checkin_service
from app.core.exceptions import AppError
import structlog

checkins_bp = Blueprint('checkins', __name__)
api = Api(checkins_bp)
logger = structlog.get_logger(__name__)


class CheckinListResource(Resource):
    method_decorators = [login_required]

    def post(self, current_user):
        try:
            data = request.get_json()
            checkin = checkin_service.create_checkin(current_user.id, data)
            return {
                'success': True,
                'message': 'Check-in saved successfully',
                'data': checkin.to_dict()
            }, 201
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e)
            }, e.status_code
        except Exception as e:
            logger.error("checkin_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def get(self, current_user):
        try:
            checkins = checkin_service.get_user_checkins(current_user.id)
            return {
                'success': True,
                'data': [c.to_dict() for c in checkins]
            }, 200
        except Exception as e:
            logger.error("get_checkins_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class CheckinTodayResource(Resource):
    method_decorators = [login_required]

    def get(self, current_user):
        try:
            checkin = checkin_service.get_today_checkin(current_user.id)
            return {
                'success': True,
                'data': checkin.to_dict() if checkin else None
            }, 200
        except Exception as e:
            logger.error("get_today_checkin_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


class CheckinStatsResource(Resource):
    method_decorators = [login_required]

    def get(self, current_user):
        try:
            stats = checkin_service.get_stats(current_user.id)
            return {
                'success': True,
                'data': stats
            }, 200
        except Exception as e:
            logger.error("get_stats_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


api.add_resource(CheckinListResource, '/')
api.add_resource(CheckinTodayResource, '/today')
api.add_resource(CheckinStatsResource, '/stats')
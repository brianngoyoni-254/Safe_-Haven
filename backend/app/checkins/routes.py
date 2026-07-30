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
        """
        Create or update today's check-in
        ---
        tags:
          - Check-ins
        security:
          - BearerAuth: []
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required: [mood, cravingLevel]
              properties:
                mood: { type: integer, minimum: 1, maximum: 5 }
                cravingLevel: { type: integer, minimum: 1, maximum: 5 }
                soberToday: { type: boolean, default: true }
                notes: { type: string, nullable: true }
        responses:
          201:
            description: Check-in saved (created, or overwritten if one already exists for today)
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          400:
            description: mood or cravingLevel out of range / missing
        """
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
        """
        List all check-ins for the current user
        ---
        tags:
          - Check-ins
        security:
          - BearerAuth: []
        responses:
          200:
            description: Check-ins, most recent first
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: array
                  items: { type: object }
        """
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
        """
        Get today's check-in for the current user
        ---
        tags:
          - Check-ins
        security:
          - BearerAuth: []
        responses:
          200:
            description: Today's check-in, or null if none exists yet
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: object
                  nullable: true
        """
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
        """
        Get aggregate check-in stats for the current user
        ---
        tags:
          - Check-ins
        security:
          - BearerAuth: []
        responses:
          200:
            description: Aggregate stats across all of the user's check-ins
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: object
                  properties:
                    total_days: { type: integer }
                    avg_mood: { type: number }
                    avg_craving: { type: number }
                    sober_days: { type: integer }
                    streak: { type: integer, description: "Consecutive sober days ending today" }
        """
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
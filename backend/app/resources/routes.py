from flask import Blueprint, request, jsonify
from app.resources.models import Resource
from app.core.decorators import login_required
from app.extensions import db
import structlog

resources_bp = Blueprint('resources', __name__)
logger = structlog.get_logger(__name__)

@resources_bp.route('/', methods=['GET'])
@login_required
def get_resources(current_user):
    try:
        county = request.args.get('county')
        type_filter = request.args.get('type')

        query = Resource.query
        if county:
            query = query.filter_by(county=county)
        if type_filter:
            query = query.filter_by(type=type_filter)

        resources = query.all()
        return jsonify({
            'success': True,
            'data': [r.to_dict() for r in resources]
        }), 200
    except Exception as e:
        logger.error("get_resources_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@resources_bp.route('/counties', methods=['GET'])
@login_required
def get_counties(current_user):
    try:
        counties = db.session.query(Resource.county).distinct().all()
        return jsonify({
            'success': True,
            'data': [c[0] for c in counties if c[0]]
        }), 200
    except Exception as e:
        logger.error("get_counties_error", user_id=current_user.id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
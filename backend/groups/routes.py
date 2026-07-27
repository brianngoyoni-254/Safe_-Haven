from flask import Blueprint, request, jsonify
from app.core.decorators import login_required
from app.groups.services import group_service
from app.core.exceptions import AppError
import logging

groups_bp = Blueprint('groups', __name__)
logger = logging.getLogger(__name__)

@groups_bp.route('/', methods=['POST'])
@login_required
def create_group(current_user):
    try:
        data = request.get_json()
        group = group_service.create_group(current_user.id, data)
        return jsonify({
            'success': True,
            'message': 'Group created successfully',
            'data': group.to_dict()
        }), 201
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Create group error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@groups_bp.route('/', methods=['GET'])
@login_required
def get_groups(current_user):
    try:
        groups = group_service.get_all_groups(current_user.id)
        return jsonify({
            'success': True,
            'data': groups
        }), 200
    except Exception as e:
        logger.error(f'Get groups error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@groups_bp.route('/<group_id>', methods=['GET'])
@login_required
def get_group(current_user, group_id):
    try:
        group = group_service.get_group(group_id, current_user.id)
        return jsonify({
            'success': True,
            'data': group
        }), 200
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Get group error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@groups_bp.route('/<group_id>/join', methods=['POST'])
@login_required
def join_group(current_user, group_id):
    try:
        group = group_service.join_group(group_id, current_user.id)
        return jsonify({
            'success': True,
            'message': 'Joined group successfully',
            'data': group.to_dict()
        }), 200
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Join group error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@groups_bp.route('/<group_id>/leave', methods=['POST'])
@login_required
def leave_group(current_user, group_id):
    try:
        group_service.leave_group(group_id, current_user.id)
        return jsonify({
            'success': True,
            'message': 'Left group successfully'
        }), 200
    except AppError as e):
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Leave group error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@groups_bp.route('/<group_id>/messages', methods=['POST'])
@login_required
def send_message(current_user, group_id):
    try:
        data = request.get_json()
        message = group_service.send_message(group_id, current_user.id, data)
        return jsonify({
            'success': True,
            'message': 'Message sent',
            'data': message.to_dict()
        }), 201
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Send message error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@groups_bp.route('/<group_id>/messages', methods=['GET'])
@login_required
def get_messages(current_user, group_id):
    try:
        limit = request.args.get('limit', 50, type=int)
        messages = group_service.get_messages(group_id, current_user.id, limit)
        return jsonify({
            'success': True,
            'data': [m.to_dict() for m in messages]
        }), 200
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Get messages error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
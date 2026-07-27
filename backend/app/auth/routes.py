from flask import Blueprint, request, jsonify
from app.auth.services import auth_service
from app.core.exceptions import AppError
from app.core.tokens import refresh_access_token
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        user = auth_service.register_user(data)
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': user.to_dict()
        }), 201
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e),
            'details': getattr(e, 'details', {})
        }), e.status_code
    except Exception as e:
        logger.error(f'Registration error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        result = auth_service.login_user(data)
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': result
        }), 200
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error(f'Login error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        if not refresh_token:
            return jsonify({'success': False, 'error': 'Refresh token required'}), 400
        
        new_token = refresh_access_token(refresh_token)
        if not new_token:
            return jsonify({'success': False, 'error': 'Invalid refresh token'}), 401
        
        return jsonify({
            'success': True,
            'data': {'access_token': new_token}
        }), 200
    except Exception as e:
        logger.error(f'Refresh error: {str(e)}', exc_info=True)
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
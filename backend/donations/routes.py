from flask import Blueprint, request, jsonify
from app.core.decorators import login_required
from donations.services import donation_service
from app.core.exceptions import AppError
import logging

donations_bp = Blueprint('donations', __name__)
logger = logging.getLogger(__name__)

@donations_bp.route('/', methods=['POST'])
def create_donation():
    """Create a donation (authenticated or anonymous)"""
    try:
        data = request.get_json()
        
        from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
        user_id = None
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
        except:
            pass
        
        donation = donation_service.create_donation(user_id, data)
        return jsonify({
            'success': True,
            'message': 'Donation initiated successfully',
            'data': donation.to_dict()
        }), 201
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e),
            'details': getattr(e, 'details', {})
        }), e.status_code
    except Exception as e:
        logger.error(f'Donation creation error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@donations_bp.route('/', methods=['GET'])
@login_required
def get_donations(current_user):
    try:
        donations = donation_service.get_user_donations(current_user.id)
        return jsonify({
            'success': True,
            'data': [d.to_dict() for d in donations]
        }), 200
    except Exception as e:
        logger.error(f'Get donations error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@donations_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """M-Pesa callback endpoint"""
    try:
        data = request.get_json()
        result = donation_service.process_callback(data)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f'M-Pesa callback error: {str(e)}', exc_info=True)
        return jsonify({'ResultCode': 1, 'ResultDesc': str(e)}), 400

@donations_bp.route('/status/<checkout_request_id>', methods=['GET'])
def check_status(checkout_request_id):
    try:
        status = donation_service.check_transaction_status(checkout_request_id)
        return jsonify({
            'success': True,
            'data': status
        }), 200
    except Exception as e:
        logger.error(f'Check status error: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': str(e)
        }), 500
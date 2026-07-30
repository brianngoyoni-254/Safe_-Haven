from flask import Blueprint, request, jsonify
from flask_restful import Resource, Api
from app.core.decorators import login_required
from donations.services import donation_service
from app.core.exceptions import AppError
import structlog

donations_bp = Blueprint('donations', __name__)
api = Api(donations_bp)
logger = structlog.get_logger(__name__)


class DonationListResource(Resource):
    # Only GET requires auth — donations can be created anonymously,
    # matching the original create_donation() behavior.
    method_decorators = {'get': [login_required]}

    def post(self):
        """
        Create a donation and trigger an M-Pesa STK push
        ---
        tags:
          - Donations
        description: >
          No auth required — donations can be made anonymously. If a valid
          Bearer token is present it's used to associate the donation with
          the logged-in user, but it's optional.
        parameters:
          - in: body
            name: body
            required: true
            schema:
              type: object
              required: [amount, phone]
              properties:
                amount: { type: integer, minimum: 1, example: 500 }
                phone:
                  type: string
                  example: "0712345678"
                  description: "Kenyan number, format 07XXXXXXXX or 01XXXXXXXX"
                name: { type: string, maxLength: 120, nullable: true }
                message: { type: string, nullable: true }
                anonymous: { type: boolean, default: false }
                frequency: { type: string, enum: [once, monthly], default: once }
        responses:
          201:
            description: Donation created and STK push initiated
            schema:
              type: object
              properties:
                success: { type: boolean }
                message: { type: string }
                data: { type: object }
          400:
            description: Validation error (bad amount or phone format)
        """
        try:
            data = request.get_json()

            from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
            user_id = None
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
            except Exception:
                pass

            donation = donation_service.create_donation(user_id, data)
            return {
                'success': True,
                'message': 'Donation initiated successfully',
                'data': donation.to_dict()
            }, 201
        except AppError as e:
            return {
                'success': False,
                'error': e.__class__.__name__,
                'message': str(e),
                'details': getattr(e, 'details', {})
            }, e.status_code
        except Exception as e:
            logger.error("donation_creation_error", error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500

    def get(self, current_user):
        """
        List the current user's donations
        ---
        tags:
          - Donations
        security:
          - BearerAuth: []
        responses:
          200:
            description: The authenticated user's donation history
            schema:
              type: object
              properties:
                success: { type: boolean }
                data:
                  type: array
                  items: { type: object }
        """
        try:
            donations = donation_service.get_user_donations(current_user.id)
            return {
                'success': True,
                'data': [d.to_dict() for d in donations]
            }, 200
        except Exception as e:
            logger.error("get_donations_error", user_id=current_user.id, error=str(e), exc_info=True)
            return {
                'success': False,
                'error': 'InternalServerError',
                'message': 'An unexpected error occurred'
            }, 500


api.add_resource(DonationListResource, '/')


# Webhook and status-lookup endpoints stay as plain blueprint routes —
# they're action/callback-style, not resource CRUD, so flask-restful
# adds friction here rather than value.

@donations_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    M-Pesa STK push result callback (Safaricom -> this server)
    ---
    tags:
      - Donations
    description: >
      Called by Safaricom's Daraja API, not by the frontend. Documented here
      for completeness — not meant to be exercised from Swagger UI.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          description: Raw Daraja STK push callback payload
    responses:
      200:
        description: Callback processed (Safaricom expects a 200 regardless of outcome)
    """
    try:
        data = request.get_json()
        result = donation_service.process_callback(data)
        return jsonify(result), 200
    except Exception as e:
        logger.error("mpesa_callback_error", error=str(e), exc_info=True)
        return jsonify({'ResultCode': 1, 'ResultDesc': str(e)}), 400


@donations_bp.route('/status/<checkout_request_id>', methods=['GET'])
def check_status(checkout_request_id):
    """
    Check the status of an M-Pesa transaction
    ---
    tags:
      - Donations
    parameters:
      - in: path
        name: checkout_request_id
        type: string
        required: true
        description: The CheckoutRequestID returned when the donation was created
    responses:
      200:
        description: Current transaction status
        schema:
          type: object
          properties:
            success: { type: boolean }
            data: { type: object }
      500:
        description: Lookup failed
    """
    try:
        status = donation_service.check_transaction_status(checkout_request_id)
        return jsonify({
            'success': True,
            'data': status
        }), 200
    except Exception as e:
        logger.error("check_status_error", checkout_request_id=checkout_request_id, error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': str(e)
        }), 500
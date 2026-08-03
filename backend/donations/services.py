from donations.models import Donation
from donations.mpesa import mpesa_service
from donations.schemas import DonationSchema
from app.users.models import User
from app.extensions import db
from app.core.exceptions import ValidationError, AppError
from marshmallow import ValidationError as MarshmallowError
from datetime import datetime, timezone
import structlog

logger = structlog.get_logger(__name__)

class DonationService:
    def create_donation(self, user_id, data):
        """Create a new donation"""
        try:
            schema = DonationSchema()
            validated = schema.load(data)
        except MarshmallowError as e:
            raise ValidationError('Invalid donation data', details=e.messages)

        phone = validated['phone']
        if phone.startswith('0'):
            phone = '254' + phone[1:]

        name = validated.get('name')
        anonymous = validated.get('anonymous', False)
        if user_id and not name:
            user = User.query.get(user_id)
            if user:
                name = user.username if not anonymous else None

        donation = Donation(
            user_id=user_id,
            amount=validated['amount'],
            phone=phone,
            name=name,
            message=validated.get('message'),
            anonymous=anonymous,
            frequency=validated.get('frequency', 'once'),
            status='pending'
        )
        db.session.add(donation)
        db.session.commit()

        try:
            account_ref = f"SAFE{donation.id[:8]}"
            response = mpesa_service.initiate_stk_push(
                phone=phone,
                amount=validated['amount'],
                account_reference=account_ref,
                transaction_desc="Donation to Safe Haven"
            )

            donation.checkout_request_id = response.get('CheckoutRequestID')
            donation.merchant_request_id = response.get('MerchantRequestID')
            db.session.commit()

            logger.info("donation_initiated", donation_id=donation.id, amount=donation.amount)
            return donation
        except Exception as e:
            donation.status = 'failed'
            db.session.commit()
            logger.error("mpesa_initiation_failed", donation_id=donation.id, error=str(e))
            raise AppError(f'Payment initiation failed: {str(e)}')

    def process_callback(self, callback_data):
        """Process M-Pesa callback"""
        try:
            body = callback_data.get('Body', {})
            stk_callback = body.get('stkCallback', {})

            result_code = stk_callback.get('ResultCode')
            checkout_request_id = stk_callback.get('CheckoutRequestID')

            donation = Donation.query.filter_by(checkout_request_id=checkout_request_id).first()
            if not donation:
                logger.warning("donation_not_found", checkout_request_id=checkout_request_id)
                return {'error': 'Donation not found'}

            if result_code == 0:
                donation.status = 'success'

                callback_metadata = stk_callback.get('CallbackMetadata', {})
                items = callback_metadata.get('Item', [])
                for item in items:
                    if item.get('Name') == 'MpesaReceiptNumber':
                        donation.mpesa_receipt_number = item.get('Value')
                    elif item.get('Name') == 'TransactionDate':
                        trans_date = str(item.get('Value'))
                        if len(trans_date) == 14:
                            dt = datetime.strptime(trans_date, '%Y%m%d%H%M%S')
                            donation.updated_at = dt.replace(tzinfo=timezone.utc)
            else:
                donation.status = 'failed'
                donation.result_code = result_code
                donation.result_desc = stk_callback.get('ResultDesc')

            db.session.commit()
            logger.info("donation_callback_processed", donation_id=donation.id, status=donation.status)
            return {'success': True, 'status': donation.status}
        except Exception as e:
            db.session.rollback()
            logger.error("callback_processing_failed", error=str(e), exc_info=True)
            raise AppError(f'Callback processing failed: {str(e)}')

    def get_receipt(self, checkout_request_id):
        """Return public receipt data for a confirmed donation.

        Deliberately refuses to hand back receipt data for donations that
        haven't succeeded yet, so a guessed/incomplete checkout_request_id
        can't be used to fish for info while a payment is still pending.
        """
        donation = Donation.query.filter_by(checkout_request_id=checkout_request_id).first()
        if not donation:
            raise ValidationError('Receipt not found')
        if donation.status != 'success':
            raise ValidationError('This donation has not been confirmed yet')
        return donation.to_receipt_dict()

    def get_user_donations(self, user_id):
        """Get user's donation history"""
        return Donation.query.filter_by(user_id=user_id).order_by(Donation.created_at.desc()).all()

    # Result codes Safaricom's stkpushquery endpoint returns that genuinely
    # mean the transaction is over and did not succeed. Anything NOT in this
    # set — including codes we've never seen before, or no ResultCode at
    # all — is treated as "still in progress", not "failed". This matters
    # because querying before the user has responded to the STK push can
    # return a variety of transient/undocumented codes (or none at all),
    # and guessing wrong there wrongly kills a payment that's still live.
    # The frontend's own poll timeout is what eventually gives up if a
    # transaction genuinely never resolves.
    _DEFINITE_FAILURE_CODES = {
        '1',     # Insufficient funds
        '1032',  # Request cancelled by user
        '2001',  # Wrong PIN entered
        '1025',  # Unable to lock subscriber (parallel transaction in progress)
    }

    def check_transaction_status(self, checkout_request_id):
        """Check transaction status"""
        try:
            donation = Donation.query.filter_by(checkout_request_id=checkout_request_id).first()
            if not donation:
                raise ValidationError('Donation not found')

            if donation.status == 'pending':
                response = mpesa_service.query_status(checkout_request_id)
                result_code = response.get('ResultCode')
                result_code_str = str(result_code) if result_code is not None else None

                if result_code_str == '0':
                    donation.status = 'success'
                    receipt = response.get('ReceiptNumber')
                    if receipt:
                        donation.mpesa_receipt_number = receipt
                    db.session.commit()
                elif result_code_str in self._DEFINITE_FAILURE_CODES:
                    donation.status = 'failed'
                    donation.result_desc = response.get('ResultDesc')
                    db.session.commit()
                else:
                    # None (no ResultCode — e.g. errorCode 500.001.1001,
                    # "The transaction is being processed"), '1037' (DS
                    # timeout — let the frontend's own timeout handle it
                    # rather than failing early), or any other/unrecognized
                    # code — don't guess, just keep waiting.
                    logger.info(
                        "mpesa_status_still_processing",
                        checkout_request_id=checkout_request_id,
                        result_code=result_code,
                        response=response,
                    )

            return donation.to_dict()
        except Exception as e:
            logger.error("check_status_failed", checkout_request_id=checkout_request_id, error=str(e), exc_info=True)
            raise AppError(f'Status check failed: {str(e)}')

donation_service = DonationService()
import structlog
from flask import Blueprint, request, jsonify

from .store import get_donation_by_checkout_id, mark_donation_result

payments_bp = Blueprint("payments", __name__)
logger = structlog.get_logger(__name__)


# POST /api/payments/mpesa/callback 
# Safaricom calls this asynchronously once the donor accepts/declines/times
# out on their phone. No auth — Safaricom can't send a Bearer token — so
# this route must not be trusted for anything beyond updating the matching
# donation row by checkout_request_id.
@payments_bp.post("/mpesa/callback")
def mpesa_callback():
    body = request.get_json(silent=True) or {}
    stk_callback = body.get("Body", {}).get("stkCallback", {})
    checkout_request_id = stk_callback.get("CheckoutRequestID")
    result_code = stk_callback.get("ResultCode")
    result_desc = stk_callback.get("ResultDesc")

    donation = get_donation_by_checkout_id(checkout_request_id)
    if not donation:
        logger.warning(
            "mpesa_callback_unknown_checkout_id",
            checkout_request_id=checkout_request_id,
        )
        # Still 200 — Safaricom retries on non-2xx, and there's nothing
        # more useful we can do with an id we don't recognize.
        return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"})

    if result_code == 0:
        items = {
            item.get("Name"): item.get("Value")
            for item in stk_callback.get("CallbackMetadata", {}).get("Item", [])
        }
        mark_donation_result(
            donation,
            status="success",
            result_code=result_code,
            result_desc=result_desc,
            mpesa_receipt_number=items.get("MpesaReceiptNumber"),
        )
        logger.info("donation_succeeded", donation_id=donation.id)
    else:
        # e.g. 1032 = user cancelled, 1037 = timeout on phone
        mark_donation_result(
            donation, status="failed", result_code=result_code, result_desc=result_desc
        )
        logger.info("donation_failed", donation_id=donation.id, result_code=result_code)

    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"})
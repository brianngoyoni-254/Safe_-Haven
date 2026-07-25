import re

import structlog
from flask import Blueprint, request, jsonify, g

from . import mpesa
from .decorators import optional_auth
from .errors import APIError
from .schemas import DonationInputSchema
from .store import (
    attach_checkout_ids,
    create_donation,
    get_donation_by_checkout_id,
    mark_donation_result,
)

donations_bp = Blueprint("donations", __name__)
logger = structlog.get_logger(__name__)


def _normalize_kenyan_phone(raw):
    digits = re.sub(r"[\s-]", "", raw or "")
    if digits.startswith("+254"):
        digits = digits[1:]
    elif digits.startswith("0"):
        digits = "254" + digits[1:]
    return digits


# POST /api/donations/mpesa/stk-push 
# Called by Donations.jsx's handlePay(). Creates a pending Donation row,
# asks Safaricom to push a PIN prompt to the donor's phone, and returns
# checkoutRequestId for the frontend to poll against.
@donations_bp.post("/mpesa/stk-push")
@optional_auth
def initiate_stk_push():
    schema = DonationInputSchema()
    data = schema.load(request.get_json(silent=True) or {})

    phone = _normalize_kenyan_phone(data["phone"])
    name = None if data["anonymous"] else data.get("name")

    donation = create_donation(
        user_id=g.user.id if getattr(g, "user", None) else None,
        amount=data["amount"],
        phone=phone,
        name=name,
        message=data.get("message"),
        anonymous=data["anonymous"],
        frequency=data["frequency"],
    )

    try:
        resp = mpesa.initiate_stk_push(
            phone=phone,
            amount=data["amount"],
            account_reference="SAFEHAVEN",
            description="Donation",
        )
    except mpesa.MpesaError:
        mark_donation_result(donation, status="failed", result_desc="Could not reach M-Pesa")
        raise APIError("Couldn't reach M-Pesa right now. Please try again.", 502)

    if str(resp.get("ResponseCode")) != "0":
        mark_donation_result(
            donation, status="failed", result_desc=resp.get("ResponseDescription")
        )
        raise APIError(resp.get("ResponseDescription", "M-Pesa request failed"), 502)

    attach_checkout_ids(donation, resp["CheckoutRequestID"], resp.get("MerchantRequestID"))
    logger.info("donation_stk_push_sent", donation_id=donation.id)

    return jsonify({"checkoutRequestId": donation.checkout_request_id}), 201


# GET /api/donations/mpesa/status/<checkout_request_id> 
# Polled by Donations.jsx every few seconds until it stops returning
# "pending".
@donations_bp.get("/mpesa/status/<checkout_request_id>")
def get_status(checkout_request_id):
    donation = get_donation_by_checkout_id(checkout_request_id)
    if not donation:
        raise APIError("Donation not found", 404)
    return jsonify({"status": donation.status})
import base64
from datetime import datetime

import requests
import structlog
from flask import current_app

logger = structlog.get_logger(__name__)


class MpesaError(Exception):
    """Raised when Safaricom's API can't be reached or returns an error."""


def _require_mpesa_config():
    """Call this at the start of any function that actually talks to
    Safaricom's API — NOT at app boot. Keeps migrations, tests, and other
    non-payment code paths from requiring M-Pesa credentials just to run."""
    required = {
        "MPESA_CONSUMER_KEY": current_app.config.get("MPESA_CONSUMER_KEY"),
        "MPESA_CONSUMER_SECRET": current_app.config.get("MPESA_CONSUMER_SECRET"),
        "MPESA_SHORTCODE": current_app.config.get("MPESA_SHORTCODE"),
        "MPESA_PASSKEY": current_app.config.get("MPESA_PASSKEY"),
        "MPESA_CALLBACK_URL": current_app.config.get("MPESA_CALLBACK_URL"),
    }
    missing = [name for name, value in required.items() if not value]
    if missing:
        raise MpesaError(
            f"M-Pesa is not fully configured. Missing: {', '.join(missing)}. "
            "Set these in your .env — get them from your app on "
            "https://developer.safaricom.co.ke."
        )


def get_access_token():
    _require_mpesa_config()

    consumer_key = current_app.config["MPESA_CONSUMER_KEY"]
    consumer_secret = current_app.config["MPESA_CONSUMER_SECRET"]
    base_url = current_app.config["MPESA_BASE_URL"]

    try:
        resp = requests.get(
            f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
            auth=(consumer_key, consumer_secret),
            timeout=10,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        logger.error("mpesa_auth_failed", error=str(e))
        raise MpesaError("Could not authenticate with M-Pesa") from e

    return resp.json()["access_token"]


def _password_and_timestamp():
    shortcode = current_app.config["MPESA_SHORTCODE"]
    passkey = current_app.config["MPESA_PASSKEY"]
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    raw = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp


def initiate_stk_push(phone, amount, account_reference, description):
    """phone must already be normalized to 2547XXXXXXXX / 2541XXXXXXXX
    (no leading +, no leading 0). Returns Safaricom's parsed JSON response,
    e.g. {"MerchantRequestID": ..., "CheckoutRequestID": ...,
    "ResponseCode": "0", "ResponseDescription": "...", "CustomerMessage": "..."}
    on success — check ResponseCode == "0" for actual success."""
    token = get_access_token()  # already validates config
    password, timestamp = _password_and_timestamp()
    shortcode = current_app.config["MPESA_SHORTCODE"]
    base_url = current_app.config["MPESA_BASE_URL"]

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": current_app.config["MPESA_TRANSACTION_TYPE"],
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": shortcode,
        "PhoneNumber": phone,
        "CallBackURL": current_app.config["MPESA_CALLBACK_URL"],
        # Daraja truncates/limits these — keep them short
        "AccountReference": account_reference[:12],
        "TransactionDesc": description[:13],
    }

    try:
        resp = requests.post(
            f"{base_url}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        logger.error("mpesa_stk_push_request_failed", error=str(e))
        raise MpesaError("Could not reach M-Pesa") from e

    return resp.json()


def query_stk_status(checkout_request_id):
    """Optional: active poll of Safaricom's own status, as a fallback for
    when the callback never arrives (e.g. local dev without a public
    callback URL). Not wired into the routes by default."""
    token = get_access_token()  # already validates config
    password, timestamp = _password_and_timestamp()
    shortcode = current_app.config["MPESA_SHORTCODE"]
    base_url = current_app.config["MPESA_BASE_URL"]

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id,
    }

    try:
        resp = requests.post(
            f"{base_url}/mpesa/stkpushquery/v1/query",
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        logger.error("mpesa_stk_query_failed", error=str(e))
        raise MpesaError("Could not reach M-Pesa") from e

    return resp.json()

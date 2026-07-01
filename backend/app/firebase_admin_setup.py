
import os

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

_firebase_app = None
_init_error = None


def _init():
    global _firebase_app, _init_error
    if _firebase_app is not None or _init_error is not None:
        return

    cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH")
    if not cred_path or not os.path.exists(cred_path):
        _init_error = (
            
        )
        return

    try:
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    except Exception as e:  # noqa: BLE001 - surfaced via verify_firebase_token
        _init_error = f"Failed to initialize Firebase Admin SDK: {e}"


def verify_firebase_token(id_token):
    """
    Verifies a Firebase ID token and returns the decoded token dict
    (contains 'uid', 'email', 'name', etc.) or raises ValueError with a
    human-readable message.
    """
    _init()
    if _init_error:
        raise ValueError(_init_error)

    try:
        return firebase_auth.verify_id_token(id_token)
    except Exception as e:  # noqa: BLE001 - normalize all firebase errors
        raise ValueError(f"Invalid Firebase token: {e}")
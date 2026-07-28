import os
import firebase_admin
from firebase_admin import credentials

_initialized = False

def init_firebase_admin():
    """Initialize the Firebase Admin SDK once, using the service account
    path from FIREBASE_SERVICE_ACCOUNT_PATH."""
    global _initialized
    if _initialized or firebase_admin._apps:
        _initialized = True
        return

    cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
    if not cred_path:
        raise RuntimeError('FIREBASE_SERVICE_ACCOUNT_PATH is not set')

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    _initialized = True

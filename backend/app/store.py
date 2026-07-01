
#In-memory user store.

#TEMPORARY — this exists only so the auth flow can be wired up and tested

import uuid
from datetime import datetime, timezone

# email -> user dict
_users_by_email = {}
# id -> user dict (same object references as above, for O(1) lookup by id)
_users_by_id = {}
# firebase_uid -> user dict
_users_by_firebase_uid = {}


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def create_user(email, username, password_hash=None, firebase_uid=None):
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "username": username,
        "password_hash": password_hash,
        "firebase_uid": firebase_uid,
        "sobriety_start": None,
        "created_at": _now_iso(),
    }
    _users_by_email[email] = user
    _users_by_id[user["id"]] = user
    if firebase_uid:
        _users_by_firebase_uid[firebase_uid] = user
    return user


def get_user_by_email(email):
    return _users_by_email.get(email)


def get_user_by_id(user_id):
    return _users_by_id.get(user_id)


def get_user_by_firebase_uid(firebase_uid):
    return _users_by_firebase_uid.get(firebase_uid)


def link_firebase_uid(user, firebase_uid):
    """Attach a firebase_uid to an existing email/password user."""
    user["firebase_uid"] = firebase_uid
    _users_by_firebase_uid[firebase_uid] = user


def public_user(user):
    """Strip sensitive fields before sending a user object to the client."""
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "sobriety_start": user["sobriety_start"],
        "created_at": user["created_at"],
    }


from .extensions import db
from .models import User


def create_user(email, username, password_hash=None, firebase_uid=None):
    user = User(
        email=email,
        username=username,
        password_hash=password_hash,
        firebase_uid=firebase_uid,
    )
    db.session.add(user)
    db.session.commit()
    return user


def get_user_by_email(email):
    return User.query.filter_by(email=email).first()


def get_user_by_id(user_id):
    return User.query.get(user_id)


def get_user_by_firebase_uid(firebase_uid):
    return User.query.filter_by(firebase_uid=firebase_uid).first()


def link_firebase_uid(user, firebase_uid):
    """Attach a firebase_uid to an existing email/password user."""
    user.firebase_uid = firebase_uid
    db.session.commit()


def public_user(user):
    """Strip sensitive fields before sending a user object to the client."""
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "sobriety_start": user.sobriety_start.isoformat() if user.sobriety_start else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
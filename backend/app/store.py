from datetime import date as date_cls

from .extensions import db
from .models import User, CheckIn


# Users 

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


# Check-ins 

def get_checkin(user_id, on_date):
    """Fetch a single day's check-in for a user, or None if not submitted yet."""
    return CheckIn.query.filter_by(user_id=user_id, date=on_date).first()


def upsert_checkin(user_id, on_date, mood, craving_level, sober_today, notes):
    """Create today's check-in, or overwrite it if the user already
    submitted one for this date (e.g. they hit "Edit check-in")."""
    checkin = get_checkin(user_id, on_date)
    if checkin is None:
        checkin = CheckIn(user_id=user_id, date=on_date)
        db.session.add(checkin)

    checkin.mood = mood
    checkin.craving_level = craving_level
    checkin.sober_today = sober_today
    checkin.notes = notes
    db.session.commit()
    return checkin


def get_checkin_history(user_id, limit=30):
    """Most recent check-ins first — used for streaks/history views."""
    return (
        CheckIn.query.filter_by(user_id=user_id)
        .order_by(CheckIn.date.desc())
        .limit(limit)
        .all()
    )


def public_checkin(checkin):
    """Shape a CheckIn row for the client, matching the CheckIn.jsx field names."""
    return {
        "id": checkin.id,
        "date": checkin.date.isoformat(),
        "mood": checkin.mood,
        "cravingLevel": checkin.craving_level,
        "soberToday": checkin.sober_today,
        "notes": checkin.notes,
        "createdAt": checkin.created_at.isoformat() if checkin.created_at else None,
        "updatedAt": checkin.updated_at.isoformat() if checkin.updated_at else None,
    }
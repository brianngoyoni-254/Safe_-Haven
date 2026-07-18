import uuid
from datetime import datetime, timezone

from app.extensions import db


def _uuid_str():
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=True, index=True)
    sobriety_start = db.Column(db.Date, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<User {self.email!r}>"


class CheckIn(db.Model):
    """One daily check-in per user. `date` + the unique constraint below
    enforce "one check-in per user per day" at the DB level, so re-submitting
    the same day updates the existing row instead of creating a duplicate."""

    __tablename__ = "checkins"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )

    # Calendar date the check-in applies to (not a timestamp) — this is what
    # "today's check-in" is looked up by.
    date = db.Column(db.Date, nullable=False)

    mood = db.Column(db.Integer, nullable=False)  # 1-5, validated in checkins.py
    craving_level = db.Column(db.Integer, nullable=False)  # 1-5, validated in checkins.py
    sober_today = db.Column(db.Boolean, nullable=False, default=True)
    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        db.UniqueConstraint("user_id", "date", name="uq_checkins_user_date"),
    )

    def __repr__(self):
        return f"<CheckIn user={self.user_id!r} date={self.date!r}>"
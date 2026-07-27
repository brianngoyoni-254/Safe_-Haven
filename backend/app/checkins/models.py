import uuid
from datetime import datetime, timezone
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class CheckIn(db.Model):
    __tablename__ = "checkins"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )
    date = db.Column(db.Date, nullable=False)
    mood = db.Column(db.Integer, nullable=False)
    craving_level = db.Column(db.Integer, nullable=False)
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

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'mood': self.mood,
            'craving_level': self.craving_level,
            'sober_today': self.sober_today,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<CheckIn user={self.user_id!r} date={self.date!r}>"
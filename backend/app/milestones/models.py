import uuid
from datetime import datetime, timezone
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class Milestone(db.Model):
    __tablename__ = "milestones"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )
    days = db.Column(db.Integer, nullable=False)
    achieved_at = db.Column(db.Date, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        db.UniqueConstraint("user_id", "days", name="uq_milestones_user_days"),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'days': self.days,
            'achieved_at': self.achieved_at.isoformat() if self.achieved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Milestone user={self.user_id!r} days={self.days!r}>"
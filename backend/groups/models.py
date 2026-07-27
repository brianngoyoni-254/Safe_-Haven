import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import ARRAY
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class Group(db.Model):
    __tablename__ = "groups"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    organizer_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )
    is_private = db.Column(db.Boolean, nullable=False, default=False)
    meeting_schedule = db.Column(db.String(255), nullable=True)
    meeting_days_of_week = db.Column(ARRAY(db.Integer), nullable=True)
    meeting_time = db.Column(db.Time, nullable=True)
    meeting_timezone = db.Column(db.String(50), nullable=True, default="Africa/Nairobi")
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    organizer = db.relationship("User", foreign_keys=[organizer_id])
    memberships = db.relationship(
        "GroupMembership", backref="group", cascade="all, delete-orphan"
    )
    messages = db.relationship(
        "GroupMessage",
        backref="group",
        cascade="all, delete-orphan",
        order_by="GroupMessage.created_at",
    )

    def to_dict(self, include_messages=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'organizer_id': self.organizer_id,
            'organizer': self.organizer.username if self.organizer else None,
            'is_private': self.is_private,
            'meeting_schedule': self.meeting_schedule,
            'meeting_days_of_week': self.meeting_days_of_week or [],
            'meeting_time': self.meeting_time.isoformat() if self.meeting_time else None,
            'meeting_timezone': self.meeting_timezone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'member_count': len(self.memberships),
            'is_member': False,
        }
        if include_messages:
            data['messages'] = [m.to_dict() for m in self.messages]
        return data

class GroupMembership(db.Model):
    __tablename__ = "group_memberships"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    group_id = db.Column(
        db.String(36), db.ForeignKey("groups.id"), nullable=False, index=True
    )
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )
    joined_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User")

    __table_args__ = (
        db.UniqueConstraint("group_id", "user_id", name="uq_group_memberships_group_user"),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_id': self.user_id,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
        }

class GroupMessage(db.Model):
    __tablename__ = "group_messages"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    group_id = db.Column(
        db.String(36), db.ForeignKey("groups.id"), nullable=False, index=True
    )
    author_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    edited_at = db.Column(db.DateTime(timezone=True), nullable=True)

    author = db.relationship("User", foreign_keys=[author_id])

    def to_dict(self):
        return {
            'id': self.id,
            'group_id': self.group_id,
            'author_id': self.author_id,
            'author_username': self.author.username if self.author else None,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'edited_at': self.edited_at.isoformat() if self.edited_at else None,
            'is_edited': self.edited_at is not None,
        }
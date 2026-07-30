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
            'organizerId': self.organizer_id,
            'organizer': self.organizer.username if self.organizer else None,
            'isPrivate': self.is_private,
            'meetingSchedule': self.meeting_schedule,
            'meetingDaysOfWeek': self.meeting_days_of_week or [],
            'meetingTime': self.meeting_time.isoformat() if self.meeting_time else None,
            'meetingTimezone': self.meeting_timezone,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'memberCount': len(self.memberships),
            'isMember': False,
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

    user = db.relationship("User", back_populates="memberships")

    __table_args__ = (
        db.UniqueConstraint("group_id", "user_id", name="uq_group_memberships_group_user"),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'groupId': self.group_id,
            'userId': self.user_id,
            'joinedAt': self.joined_at.isoformat() if self.joined_at else None,
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

    author = db.relationship("User", foreign_keys=[author_id], back_populates="messages")

    def to_dict(self):
        return {
            'id': self.id,
            'groupId': self.group_id,
            'authorId': self.author_id,
            'authorName': self.author.username if self.author else None,
            'text': self.text,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'editedAt': self.edited_at.isoformat() if self.edited_at else None,
            'isEdited': self.edited_at is not None,
        }
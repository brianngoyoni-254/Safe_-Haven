import uuid
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
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
    goals = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    checkins = db.relationship('CheckIn', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    donations = db.relationship('Donation', backref='user', lazy=True)
    memberships = db.relationship('GroupMembership', backref='user', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('GroupMessage', backref='author', lazy=True)

    def set_password(self, password):
        if password:
            self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'firebase_uid': self.firebase_uid,
            'sobriety_start': self.sobriety_start.isoformat() if self.sobriety_start else None,
            'goals': self.goals,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.email!r}>"
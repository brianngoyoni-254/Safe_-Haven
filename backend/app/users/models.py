import uuid
from datetime import datetime, timezone
import bcrypt
from werkzeug.security import check_password_hash
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
    memberships = db.relationship('GroupMembership', back_populates='user', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('GroupMessage', back_populates='author', lazy=True)

    def set_password(self, password):
        if password:
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            self.password_hash = hashed.decode('utf-8')

    def check_password(self, password):
        if not self.password_hash:
            return False

        # Existing accounts were hashed with werkzeug (pbkdf2:.../scrypt:...).
        # Verify against that scheme once, then silently re-hash with bcrypt
        # so every account is on bcrypt after its next successful login.
        if self.password_hash.startswith(('pbkdf2:', 'scrypt:')):
            if check_password_hash(self.password_hash, password):
                self.set_password(password)
                db.session.commit()
                return True
            return False

        try:
            return bcrypt.checkpw(
                password.encode('utf-8'),
                self.password_hash.encode('utf-8'),
            )
        except ValueError:
            # Malformed/unrecognized hash format
            return False

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
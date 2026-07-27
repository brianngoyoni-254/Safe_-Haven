import uuid
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class LibraryTopic(db.Model):
    __tablename__ = "library_topics"

    id = db.Column(db.String(50), primary_key=True)
    label = db.Column(db.String(120), nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    bg = db.Column(db.String(50), nullable=False)
    badge = db.Column(db.String(120), nullable=False)
    blurb = db.Column(db.Text, nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    readings = db.relationship(
        "LibraryReading",
        backref="topic",
        order_by="LibraryReading.position",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label,
            'icon': self.icon,
            'color': self.color,
            'bg': self.bg,
            'badge': self.badge,
            'blurb': self.blurb,
            'position': self.position,
            'readings': [r.to_dict() for r in self.readings],
        }

class LibraryReading(db.Model):
    __tablename__ = "library_readings"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    topic_id = db.Column(
        db.String(50), db.ForeignKey("library_topics.id"), nullable=False, index=True
    )
    title = db.Column(db.String(255), nullable=False)
    publisher = db.Column(db.String(255), nullable=False)
    format = db.Column(db.String(80), nullable=False)
    desc = db.Column(db.Text, nullable=False)
    url = db.Column(db.String(500), nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'topic_id': self.topic_id,
            'title': self.title,
            'publisher': self.publisher,
            'format': self.format,
            'desc': self.desc,
            'url': self.url,
            'position': self.position,
        }
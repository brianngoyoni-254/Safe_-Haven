import uuid
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class VideoTopic(db.Model):
    __tablename__ = "video_topics"

    id = db.Column(db.String(50), primary_key=True)
    label = db.Column(db.String(120), nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    bg = db.Column(db.String(50), nullable=False)
    badge = db.Column(db.String(120), nullable=False)
    blurb = db.Column(db.Text, nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    videos = db.relationship(
        "Video",
        backref="topic",
        order_by="Video.position",
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
            'videos': [v.to_dict() for v in self.videos],
        }

class Video(db.Model):
    __tablename__ = "videos"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    topic_id = db.Column(
        db.String(50), db.ForeignKey("video_topics.id"), nullable=False, index=True
    )
    title = db.Column(db.String(255), nullable=False)
    publisher = db.Column(db.String(255), nullable=False)
    format = db.Column(db.String(80), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
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
            'duration': self.duration,
            'desc': self.desc,
            'url': self.url,
            'position': self.position,
        }
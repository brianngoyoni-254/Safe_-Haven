import uuid
from datetime import datetime, timezone
from app.extensions import db

def _uuid_str():
    return str(uuid.uuid4())

class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False, index=True)
    county = db.Column(db.String(80), nullable=False, index=True)
    region = db.Column(db.String(80), nullable=False, index=True)
    address = db.Column(db.String(500), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'county': self.county,
            'region': self.region,
            'address': self.address,
            'phone': self.phone,
            'website': self.website,
            'lat': self.lat,
            'lng': self.lng,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Resource name={self.name!r} county={self.county!r}>"
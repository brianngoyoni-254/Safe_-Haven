import uuid
from sqlalchemy.dialects.postgresql import ARRAY
from app.extensions import db


def _uuid_str():
    return str(uuid.uuid4())


class CrisisEmergencyLine(db.Model):
    """One "immediate danger" line (police, ambulance, Red Cross) shown at
    the top of the Crisis page — flat list, no categories, static editorial
    content seeded via seed_crisis.py."""

    __tablename__ = "crisis_emergency_lines"

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    numbers = db.Column(ARRAY(db.String(30)), nullable=False, default=list)
    desc = db.Column(db.Text, nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self):
        return f"<CrisisEmergencyLine id={self.id!r}>"


class CrisisCategory(db.Model):
    """A support category section on the Crisis page (e.g. "Suicide &
    Mental Health Crisis"), grouping one or more hotlines. `icon` is a
    lucide-react icon name resolved to a component client-side, same
    pattern as LibraryTopic.icon."""

    __tablename__ = "crisis_categories"

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    nav_label = db.Column(db.String(80), nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    hotlines = db.relationship(
        "CrisisHotline",
        backref="category",
        order_by="CrisisHotline.position",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<CrisisCategory id={self.id!r}>"


class CrisisHotline(db.Model):
    """One hotline (e.g. "Befrienders Kenya") within a CrisisCategory."""

    __tablename__ = "crisis_hotlines"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    category_id = db.Column(
        db.String(50), db.ForeignKey("crisis_categories.id"), nullable=False, index=True
    )

    name = db.Column(db.String(150), nullable=False)
    numbers = db.Column(ARRAY(db.String(30)), nullable=False, default=list)
    whatsapp = db.Column(db.String(30), nullable=True)
    desc = db.Column(db.Text, nullable=False)
    position = db.Column(db.Integer, nullable=False, default=0)

    def __repr__(self):
        return f"<CrisisHotline name={self.name!r}>"
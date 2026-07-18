import uuid
from datetime import datetime, timezone

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
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<User {self.email!r}>"


class CheckIn(db.Model):
    """One daily check-in per user. `date` + the unique constraint below
    enforce "one check-in per user per day" at the DB level, so re-submitting
    the same day updates the existing row instead of creating a duplicate."""

    __tablename__ = "checkins"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id"), nullable=False, index=True
    )

    # Calendar date the check-in applies to (not a timestamp) — this is what
    # "today's check-in" is looked up by.
    date = db.Column(db.Date, nullable=False)

    mood = db.Column(db.Integer, nullable=False)  # 1-5, validated in checkins.py
    craving_level = db.Column(db.Integer, nullable=False)  # 1-5, validated in checkins.py
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

    def __repr__(self):
        return f"<CheckIn user={self.user_id!r} date={self.date!r}>"


class Milestone(db.Model):
    """One row per (user, milestone threshold) once it's been earned. `days`
    is the threshold from MILESTONE_DAYS in milestones.py (7, 30, 90, ...).
    `achieved_at` is fixed the first time the threshold is crossed, so a
    badge's earned date doesn't drift if sobriety_start is edited later."""

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

    def __repr__(self):
        return f"<Milestone user={self.user_id!r} days={self.days!r}>"


class Resource(db.Model):
    """A rehab/recovery-support facility shown on the Resources map. Static
    reference data (seeded via seed_resources.py) rather than user-generated,
    so there's no user_id — every user sees the same directory."""

    __tablename__ = "resources"

    id = db.Column(db.String(36), primary_key=True, default=_uuid_str)

    name = db.Column(db.String(255), nullable=False)
    # One of: Residential, Outpatient, Counseling, Public — kept as a plain
    # string (not an Enum) so new categories can be added without a migration.
    type = db.Column(db.String(50), nullable=False, index=True)
    county = db.Column(db.String(80), nullable=False, index=True)
    region = db.Column(db.String(80), nullable=False, index=True)
    address = db.Column(db.String(500), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    website = db.Column(db.String(255), nullable=True)

    # Town/area-level approximations unless a facility has been geocoded
    # precisely — good enough for map pins and "centers near me" sorting.
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<Resource name={self.name!r} county={self.county!r}>"


class LibraryTopic(db.Model):
    """A topic section on the reading-library tab (e.g. "Alcohol Use"),
    grouping a curated set of external articles/guides. Static editorial
    content — seeded via seed_content.py — not user-generated."""

    __tablename__ = "library_topics"

    # Human-readable slug (e.g. "alcohol") doubles as the primary key, since
    # the frontend already keyed off this id and it's stable/curated by us.
    id = db.Column(db.String(50), primary_key=True)

    label = db.Column(db.String(120), nullable=False)
    # lucide-react icon name (e.g. "Wine") — resolved to a component on the
    # frontend via a lookup table, since icon components can't be stored.
    icon = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    bg = db.Column(db.String(50), nullable=False)
    badge = db.Column(db.String(120), nullable=False)
    blurb = db.Column(db.Text, nullable=False)
    # Preserves the original curated ordering of topics on the page.
    position = db.Column(db.Integer, nullable=False, default=0)

    readings = db.relationship(
        "LibraryReading",
        backref="topic",
        order_by="LibraryReading.position",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<LibraryTopic id={self.id!r}>"


class LibraryReading(db.Model):
    """One external article/guide/book link within a LibraryTopic."""

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

    def __repr__(self):
        return f"<LibraryReading title={self.title!r}>"


class VideoTopic(db.Model):
    """A topic section on the video-library tab (e.g. "Real Recovery
    Stories"), grouping curated external videos. Static editorial content —
    seeded via seed_content.py — not user-generated."""

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

    def __repr__(self):
        return f"<VideoTopic id={self.id!r}>"


class Video(db.Model):
    """One external video link (mostly YouTube) within a VideoTopic."""

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

    def __repr__(self):
        return f"<Video title={self.title!r}>"
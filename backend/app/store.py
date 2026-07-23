from datetime import date as date_cls, timedelta

from .extensions import db
from .models import (
    User,
    CheckIn,
    Milestone,
    Resource,
    LibraryTopic,
    LibraryReading,
    VideoTopic,
    Video,
    CrisisEmergencyLine,
    CrisisCategory,
    CrisisHotline,
    JournalEntry,
    Group,
    GroupMembership,
    GroupMessage,
)


# Users 

def create_user(email, username, password_hash=None, firebase_uid=None):
    user = User(
        email=email,
        username=username,
        password_hash=password_hash,
        firebase_uid=firebase_uid,
    )
    db.session.add(user)
    db.session.commit()
    return user


def get_user_by_email(email):
    return User.query.filter_by(email=email).first()


def get_user_by_id(user_id):
    return User.query.get(user_id)


def get_user_by_firebase_uid(firebase_uid):
    return User.query.filter_by(firebase_uid=firebase_uid).first()


def link_firebase_uid(user, firebase_uid):
    """Attach a firebase_uid to an existing email/password user."""
    user.firebase_uid = firebase_uid
    db.session.commit()


def set_sobriety_start(user, on_date):
    user.sobriety_start = on_date
    db.session.commit()
    return user


def update_profile(user, username, sobriety_start, goals):
    """Updates the editable fields on Profile.jsx in one call. sobriety_start
    and goals may be None (cleared); username is always required/validated
    by the route before this is called."""
    user.username = username
    user.sobriety_start = sobriety_start
    user.goals = goals
    db.session.commit()
    return user


def public_user(user):
    """Strip sensitive fields before sending a user object to the client."""
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "sobriety_start": user.sobriety_start.isoformat() if user.sobriety_start else None,
        "goals": user.goals,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


#  Check-ins 

def get_checkin(user_id, on_date):
    """Fetch a single day's check-in for a user, or None if not submitted yet."""
    return CheckIn.query.filter_by(user_id=user_id, date=on_date).first()


def upsert_checkin(user_id, on_date, mood, craving_level, sober_today, notes):
    """Create today's check-in, or overwrite it if the user already
    submitted one for this date (e.g. they hit "Edit check-in")."""
    checkin = get_checkin(user_id, on_date)
    if checkin is None:
        checkin = CheckIn(user_id=user_id, date=on_date)
        db.session.add(checkin)

    checkin.mood = mood
    checkin.craving_level = craving_level
    checkin.sober_today = sober_today
    checkin.notes = notes
    db.session.commit()
    return checkin


def get_checkin_history(user_id, limit=30):
    """Most recent check-ins first — used for streaks/history views."""
    return (
        CheckIn.query.filter_by(user_id=user_id)
        .order_by(CheckIn.date.desc())
        .limit(limit)
        .all()
    )


def public_checkin(checkin):
    """Shape a CheckIn row for the client, matching the CheckIn.jsx field names."""
    return {
        "id": checkin.id,
        "date": checkin.date.isoformat(),
        "mood": checkin.mood,
        "cravingLevel": checkin.craving_level,
        "soberToday": checkin.sober_today,
        "notes": checkin.notes,
        "createdAt": checkin.created_at.isoformat() if checkin.created_at else None,
        "updatedAt": checkin.updated_at.isoformat() if checkin.updated_at else None,
    }


# Milestones 

def sync_earned_milestones(user_id, sobriety_start, milestone_days):
    """For every threshold in milestone_days already reached as of today,
    ensure a Milestone row exists with achieved_at fixed to the calendar
    date it was actually reached (sobriety_start + days) — not "today" —
    so the earned date doesn't drift if this runs late or start date is
    edited later. Safe to call on every /api/milestones request."""
    if sobriety_start is None:
        return []

    sober_days = (date_cls.today() - sobriety_start).days
    reached = [d for d in milestone_days if sober_days >= d]

    existing = {
        m.days: m
        for m in Milestone.query.filter_by(user_id=user_id).all()
    }

    for days in reached:
        if days in existing:
            continue
        milestone = Milestone(
            user_id=user_id,
            days=days,
            achieved_at=sobriety_start + timedelta(days=days),
        )
        db.session.add(milestone)
        existing[days] = milestone

    db.session.commit()
    return sorted(existing.values(), key=lambda m: m.days)


def public_milestone(milestone):
    return {
        "days": milestone.days,
        "achievedAt": milestone.achieved_at.isoformat(),
    }


# Resources 

def list_resources(type_filter=None, region_filter=None, query=None):
    """Rehab-centre directory, filtered server-side by type/region and a
    free-text query against name, address, county, and type. Distance-based
    sorting stays on the frontend since it depends on the user's live
    (browser) geolocation, not anything the server knows."""
    q = Resource.query

    if type_filter and type_filter != "All":
        q = q.filter_by(type=type_filter)
    if region_filter and region_filter != "All":
        q = q.filter_by(region=region_filter)
    if query:
        like = f"%{query.strip()}%"
        q = q.filter(
            db.or_(
                Resource.name.ilike(like),
                Resource.address.ilike(like),
                Resource.county.ilike(like),
                Resource.type.ilike(like),
            )
        )

    return q.order_by(Resource.region, Resource.county, Resource.name).all()


def public_resource(resource):
    """Shape a Resource row for the client, matching the RESOURCES entries
    the frontend used before this became a real endpoint (Resources.jsx)."""
    return {
        "id": resource.id,
        "name": resource.name,
        "type": resource.type,
        "county": resource.county,
        "region": resource.region,
        "address": resource.address,
        "phone": resource.phone,
        "website": resource.website,
        "lat": resource.lat,
        "lng": resource.lng,
    }


# Reading library 

def list_library_topics():
    """All library topics with their readings, in curated display order."""
    return LibraryTopic.query.order_by(LibraryTopic.position).all()


def public_library_topic(topic):
    """Shape a LibraryTopic (+ readings) for the client, matching the
    LIBRARY_TOPICS shape the frontend used before this became a real
    endpoint. `icon` is a lucide-react icon name resolved to a component
    client-side, since components can't be stored in the database."""
    return {
        "id": topic.id,
        "label": topic.label,
        "icon": topic.icon,
        "color": topic.color,
        "bg": topic.bg,
        "badge": topic.badge,
        "blurb": topic.blurb,
        "readings": [
            {
                "title": r.title,
                "publisher": r.publisher,
                "format": r.format,
                "desc": r.desc,
                "url": r.url,
            }
            for r in topic.readings
        ],
    }


# Video library 

def list_video_topics():
    """All video topics with their videos, in curated display order."""
    return VideoTopic.query.order_by(VideoTopic.position).all()


def public_video_topic(topic):
    """Shape a VideoTopic (+ videos) for the client, matching the
    VIDEO_LIBRARY shape the frontend used before this became a real
    endpoint."""
    return {
        "id": topic.id,
        "label": topic.label,
        "icon": topic.icon,
        "color": topic.color,
        "bg": topic.bg,
        "badge": topic.badge,
        "blurb": topic.blurb,
        "videos": [
            {
                "title": v.title,
                "publisher": v.publisher,
                "format": v.format,
                "duration": v.duration,
                "desc": v.desc,
                "url": v.url,
            }
            for v in topic.videos
        ],
    }


# Crisis support 

def list_crisis_emergency_lines():
    """The top "immediate danger" lines, in curated display order."""
    return CrisisEmergencyLine.query.order_by(CrisisEmergencyLine.position).all()


def public_crisis_emergency_line(line):
    return {
        "id": line.id,
        "name": line.name,
        "numbers": line.numbers or [],
        "desc": line.desc,
    }


def list_crisis_categories():
    """All crisis support categories with their hotlines, in curated
    display order."""
    return CrisisCategory.query.order_by(CrisisCategory.position).all()


def public_crisis_category(category):
    """Shape a CrisisCategory (+ hotlines) for the client, matching the
    SUPPORT_CATEGORIES shape Crisis.jsx used before this became a real
    endpoint. `icon` is a lucide-react icon name resolved to a component
    client-side, same as LibraryTopic."""
    return {
        "id": category.id,
        "title": category.title,
        "navLabel": category.nav_label,
        "icon": category.icon,
        "color": category.color,
        "lines": [
            {
                "name": h.name,
                "numbers": h.numbers or [],
                "whatsapp": h.whatsapp,
                "desc": h.desc,
            }
            for h in category.hotlines
        ],
    }


# Journal 

def list_journal_entries(user_id):
    """A user's own entries, most recently created first — matches new
    entries being prepended to the top of the list on the frontend."""
    return (
        JournalEntry.query.filter_by(user_id=user_id)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )


def get_journal_entry(entry_id, user_id):
    """Scoped to user_id so one user can never fetch, edit, or delete
    another user's entry, even by guessing an id."""
    return JournalEntry.query.filter_by(id=entry_id, user_id=user_id).first()


def create_journal_entry(user_id, title, content, mood, tags):
    entry = JournalEntry(
        user_id=user_id,
        title=title,
        content=content,
        mood=mood,
        tags=tags,
    )
    db.session.add(entry)
    db.session.commit()
    return entry


def update_journal_entry(entry, title, content, mood, tags):
    entry.title = title
    entry.content = content
    entry.mood = mood
    entry.tags = tags
    db.session.commit()
    return entry


def delete_journal_entry(entry):
    db.session.delete(entry)
    db.session.commit()


def public_journal_entry(entry):
    """Shape a JournalEntry row for the client, matching what Journals.jsx
    expects: { id, title, content, mood, tags, updatedAt }."""
    return {
        "id": entry.id,
        "title": entry.title,
        "content": entry.content,
        "mood": entry.mood,
        "tags": entry.tags or [],
        "createdAt": entry.created_at.isoformat() if entry.created_at else None,
        "updatedAt": entry.updated_at.isoformat() if entry.updated_at else None,
    }


# Groups 

def create_group(organizer_id, name, description, category, is_private, meeting_schedule):
    """Creates the group and auto-joins the organizer as its first member —
    matches the frontend's optimistic handleCreate(), which sets
    memberCount: 1, isMember: true on the group it just created."""
    group = Group(
        organizer_id=organizer_id,
        name=name,
        description=description,
        category=category,
        is_private=is_private,
        meeting_schedule=meeting_schedule,
    )
    db.session.add(group)
    db.session.flush()  # so group.id exists for the membership row below

    db.session.add(GroupMembership(group_id=group.id, user_id=organizer_id))
    db.session.commit()
    return group


def get_group(group_id):
    return Group.query.get(group_id)


def list_groups():
    """All groups, newest first — matches the order new groups appear in
    on the frontend (prepended to the top of the list)."""
    return Group.query.order_by(Group.created_at.desc()).all()


def list_my_groups(user_id):
    """Groups the given user currently belongs to, newest-joined first."""
    return (
        Group.query.join(GroupMembership, GroupMembership.group_id == Group.id)
        .filter(GroupMembership.user_id == user_id)
        .order_by(GroupMembership.joined_at.desc())
        .all()
    )


def delete_group(group):
    db.session.delete(group)
    db.session.commit()


def get_member_count(group_id):
    return GroupMembership.query.filter_by(group_id=group_id).count()


def is_member(group_id, user_id):
    return (
        GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        is not None
    )


def join_group(group_id, user_id):
    """No-op if already a member (idempotent) — avoids a race where a
    double-click on "Join" trips the unique constraint."""
    if not is_member(group_id, user_id):
        db.session.add(GroupMembership(group_id=group_id, user_id=user_id))
        db.session.commit()
    return get_group(group_id)


def leave_group(group_id, user_id):
    membership = GroupMembership.query.filter_by(
        group_id=group_id, user_id=user_id
    ).first()
    if membership:
        db.session.delete(membership)
        db.session.commit()
    return get_group(group_id)


def public_group(group, current_user_id=None):
    """Shape a Group row for the client, matching the MOCK_GROUPS shape in
    Groups.jsx (organizerId/organizerName/memberCount/isPrivate/
    meetingSchedule/isMember)."""
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "category": group.category,
        "organizerId": group.organizer_id,
        "organizerName": group.organizer.username if group.organizer else None,
        "memberCount": get_member_count(group.id),
        "isPrivate": group.is_private,
        "meetingSchedule": group.meeting_schedule,
        "isMember": is_member(group.id, current_user_id) if current_user_id else False,
    }


# Group messages 

def get_messages(group_id, limit=None):
    """Oldest first, matching how Groups.jsx renders the chat thread
    top-to-bottom. `limit` (if given) still returns oldest-first — it grabs
    the most recent N, then re-sorts ascending."""
    q = GroupMessage.query.filter_by(group_id=group_id).order_by(
        GroupMessage.created_at.desc()
    )
    if limit:
        rows = q.limit(limit).all()
        return list(reversed(rows))
    return list(reversed(q.all()))


def create_message(group_id, author_id, text):
    message = GroupMessage(group_id=group_id, author_id=author_id, text=text)
    db.session.add(message)
    db.session.commit()
    return message


def get_message(message_id):
    return GroupMessage.query.get(message_id)


def edit_message(message_id, author_id, text):
    """Returns the updated message, or None if it doesn't exist or
    author_id doesn't match — the route layer turns None into a 403/404."""
    from datetime import datetime, timezone

    message = get_message(message_id)
    if not message or message.author_id != author_id:
        return None

    message.text = text
    message.edited_at = datetime.now(timezone.utc)
    db.session.commit()
    return message


def delete_message(message_id, author_id):
    """Returns True if deleted, False if the message doesn't exist or
    author_id doesn't match."""
    message = get_message(message_id)
    if not message or message.author_id != author_id:
        return False

    db.session.delete(message)
    db.session.commit()
    return True


def public_message(message):
    """Shape a GroupMessage row for the client, matching MOCK_MESSAGES in
    Groups.jsx (authorId/authorName/text/createdAt/editedAt)."""
    return {
        "id": message.id,
        "authorId": message.author_id,
        "authorName": message.author.username if message.author else None,
        "text": message.text,
        "createdAt": message.created_at.isoformat() if message.created_at else None,
        "editedAt": message.edited_at.isoformat() if message.edited_at else None,
    }
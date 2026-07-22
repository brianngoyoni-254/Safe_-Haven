"""flask seed-groups -- seeds a handful of demo organizer accounts, the six
support groups that used to live in Groups.jsx's MOCK_GROUPS, and a few
opening chat messages, so the Groups page isn't empty on a fresh database.

Idempotent: safe to run more than once -- looks up existing rows by email
(users) and by name (groups) before creating anything.

The original mock data was owned by frontend-only fake ids (u1, u2, ...)
that never existed as real users, so this creates real User rows for those
organizers first (with a shared demo password) and points the real Group
rows at them instead.
"""
import click
from flask.cli import with_appcontext
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models import User, Group, GroupMembership, GroupMessage

DEMO_PASSWORD = "SafeHavenDemo123"

# key -> (username, email). Emails are fake/local -- these accounts exist
# only to own demo content, not for anyone to actually receive mail at.
DEMO_ORGANIZERS = {
    "jordan": ("Jordan", "demo.jordan@safehaven.local"),
    "alex":   ("Alex",   "demo.alex@safehaven.local"),
    "sam":    ("Sam",    "demo.sam@safehaven.local"),
    "riley":  ("Riley",  "demo.riley@safehaven.local"),
    "morgan": ("Morgan", "demo.morgan@safehaven.local"),
    "casey":  ("Casey",  "demo.casey@safehaven.local"),
}

# Matches MOCK_GROUPS from the old Groups.jsx, minus memberCount/isMember
# (those are now derived from real GroupMembership rows below).
DEMO_GROUPS = [
    {
        "key": "morning-recovery-circle",
        "name": "Morning Recovery Circle",
        "description": "A calm space to check in before the day starts. We share wins, struggles, and coffee (virtually).",
        "category": "Substance Recovery",
        "organizer": "jordan",
        "is_private": False,
        "meeting_schedule": "Every day, 7:00 AM EST via video",
        "extra_members": ["alex", "riley"],
    },
    {
        "key": "sober-parents-support",
        "name": "Sober Parents Support",
        "description": "For parents balancing recovery with raising kids. Judgment-free, practical, and honest.",
        "category": "Family Support",
        "organizer": "alex",
        "is_private": False,
        "meeting_schedule": "Tuesdays & Thursdays, 8:00 PM EST",
        "extra_members": ["jordan"],
    },
    {
        "key": "young-adults-in-recovery",
        "name": "Young Adults in Recovery",
        "description": "18-30 crowd navigating school, work, and dating while staying sober. You're not alone in this.",
        "category": "Young Adults (18-30)",
        "organizer": "sam",
        "is_private": False,
        "meeting_schedule": "Sundays, 6:00 PM EST",
        "extra_members": [],
    },
    {
        "key": "grief-after-loss",
        "name": "Grief After Loss",
        "description": "Processing grief tied to addiction and loss, together. A gentle, listening-first group.",
        "category": "Grief & Loss",
        "organizer": "riley",
        "is_private": True,
        "meeting_schedule": "Wednesdays, 7:30 PM EST",
        "extra_members": [],
    },
    {
        "key": "womens-wellness-circle",
        "name": "Women's Wellness Circle",
        "description": "A women-only space focused on holistic recovery -- mind, body, and community.",
        "category": "Women's Group",
        "organizer": "morgan",
        "is_private": False,
        "meeting_schedule": "Mondays, 6:30 PM EST",
        "extra_members": ["riley"],
    },
    {
        "key": "faith-and-recovery",
        "name": "Faith & Recovery",
        "description": "Leaning on faith as part of the healing process. All denominations welcome.",
        "category": "Faith-Based",
        "organizer": "casey",
        "is_private": False,
        "meeting_schedule": "Saturdays, 10:00 AM EST",
        "extra_members": [],
    },
]

# group_key -> [(organizer_key, text), ...], oldest first. Matches the flavor
# of the old MOCK_MESSAGES.
DEMO_MESSAGES = {
    "morning-recovery-circle": [
        ("jordan", "Good morning everyone! How'd last night go?"),
        ("riley", "Rough night but I made it through. Grateful for this group."),
        ("alex", "Proud of you. That's what counts."),
    ],
    "sober-parents-support": [
        ("alex", "Reminder: meeting moved to 8pm tonight, not 7."),
    ],
}


def _get_or_create_organizer(key):
    username, email = DEMO_ORGANIZERS[key]
    user = User.query.filter_by(email=email).first()
    if user:
        return user
    user = User(
        email=email,
        username=username,
        password_hash=generate_password_hash(DEMO_PASSWORD),
    )
    db.session.add(user)
    db.session.flush()
    return user


@click.command("seed-groups")
@with_appcontext
def seed_groups_command():
    """Seed demo organizer accounts, support groups, and opening messages."""
    organizer_users = {}
    created_users = 0
    for key in DEMO_ORGANIZERS:
        before = User.query.filter_by(email=DEMO_ORGANIZERS[key][1]).first()
        user = _get_or_create_organizer(key)
        organizer_users[key] = user
        if not before:
            created_users += 1
    db.session.commit()

    created_groups = 0
    group_rows = {}
    for spec in DEMO_GROUPS:
        existing = Group.query.filter_by(name=spec["name"]).first()
        if existing:
            group_rows[spec["key"]] = existing
            continue

        group = Group(
            name=spec["name"],
            description=spec["description"],
            category=spec["category"],
            organizer_id=organizer_users[spec["organizer"]].id,
            is_private=spec["is_private"],
            meeting_schedule=spec["meeting_schedule"],
        )
        db.session.add(group)
        db.session.flush()

        db.session.add(GroupMembership(group_id=group.id, user_id=organizer_users[spec["organizer"]].id))
        for member_key in spec["extra_members"]:
            db.session.add(GroupMembership(group_id=group.id, user_id=organizer_users[member_key].id))

        group_rows[spec["key"]] = group
        created_groups += 1

    db.session.commit()

    created_messages = 0
    for group_key, messages in DEMO_MESSAGES.items():
        group = group_rows.get(group_key)
        if not group or GroupMessage.query.filter_by(group_id=group.id).first():
            continue  # already has messages -- don't duplicate on re-run
        for author_key, text in messages:
            db.session.add(GroupMessage(
                group_id=group.id,
                author_id=organizer_users[author_key].id,
                text=text,
            ))
            created_messages += 1

    db.session.commit()

    click.echo(
        f"Seeded {created_users} demo organizer(s), {created_groups} group(s), "
        f"{created_messages} message(s). Demo login password: {DEMO_PASSWORD}"
    )
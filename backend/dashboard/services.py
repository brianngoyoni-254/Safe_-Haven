from datetime import date, timedelta, datetime
from zoneinfo import ZoneInfo

from app.checkins.models import CheckIn
from app.milestones.models import Milestone
from app.extensions import db

MILESTONE_DAYS = [7, 30, 90, 180, 365]
CHECKIN_HISTORY_LIMIT = 30


def get_checkin(user_id, checkin_date):
    return CheckIn.query.filter_by(user_id=user_id, date=checkin_date).first()


def get_checkin_history(user_id, limit=30):
    return (
        CheckIn.query.filter_by(user_id=user_id)
        .order_by(CheckIn.date.desc())
        .limit(limit)
        .all()
    )


def public_checkin(checkin):
    if checkin is None:
        return None
    return checkin.to_dict()


def sync_earned_milestones(user_id, sobriety_start, milestone_days):
    if not sobriety_start:
        return []

    today = date.today()
    days_sober = (today - sobriety_start).days
    earned = []

    for days in milestone_days:
        if days <= days_sober:
            milestone = Milestone.query.filter_by(user_id=user_id, days=days).first()
            if not milestone:
                milestone = Milestone(
                    user_id=user_id,
                    days=days,
                    achieved_at=sobriety_start + timedelta(days=days),
                )
                db.session.add(milestone)
                db.session.commit()
            earned.append(milestone)

    return earned


def public_milestone(milestone):
    if milestone is None:
        return None
    return milestone.to_dict()


def get_upcoming_group_session(user_id):
    """Finds the next scheduled session, among groups the user has joined,
    that has a structured meeting schedule set (meeting_days_of_week +
    meeting_time). Groups with only a free-text meeting_schedule (no
    structured fields) are skipped — there's nothing to compute a real
    date/time from. Returns None if no upcoming session is found.

    Matches the shape Dashboard.jsx expects:
        { groupId, groupName, time, meetsToday }
    """
    from groups.models import Group, GroupMembership

    groups = (
        Group.query.join(GroupMembership, GroupMembership.group_id == Group.id)
        .filter(GroupMembership.user_id == user_id)
        .filter(Group.meeting_days_of_week.isnot(None))
        .filter(Group.meeting_time.isnot(None))
        .all()
    )

    best = None  # (next_occurrence_local_dt, group, meets_today)

    for group in groups:
        tz = ZoneInfo(group.meeting_timezone or "Africa/Nairobi")
        now_local = datetime.now(tz)

        for offset in range(8):
            candidate_date = now_local.date() + timedelta(days=offset)
            if candidate_date.isoweekday() not in group.meeting_days_of_week:
                continue

            candidate_dt = datetime.combine(
                candidate_date, group.meeting_time, tzinfo=tz
            )
            if candidate_dt <= now_local:
                continue

            if best is None or candidate_dt < best[0]:
                best = (candidate_dt, group, offset == 0)
            break

    if best is None:
        return None

    next_dt, group, meets_today = best
    return {
        "groupId": group.id,
        "groupName": group.name,
        "time": _format_session_time(next_dt, meets_today),
        "meetsToday": meets_today,
    }


def _format_session_time(dt, meets_today):
    """'Today at 8:00 PM' / 'Tuesday at 8:00 PM' label for the dashboard card."""
    time_str = dt.strftime("%-I:%M %p")
    if meets_today:
        return f"Today at {time_str}"
    return f"{dt.strftime('%A')} at {time_str}"
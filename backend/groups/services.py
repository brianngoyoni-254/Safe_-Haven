from groups.models import Group, GroupMembership, GroupMessage
from app.extensions import db
from app.core.exceptions import ValidationError, NotFoundError, ForbiddenError
from datetime import datetime, timezone
import structlog

logger = structlog.get_logger(__name__)

GROUP_CATEGORIES = [
    "Substance Recovery",
    "Alcohol Recovery",
    "Mental Health",
    "Grief & Loss",
    "Family Support",
    "LGBTQ+ Recovery",
    "Women's Group",
    "Men's Group",
    "Young Adults (18-30)",
    "Faith-Based",
    "Trauma & PTSD",
    "General Wellness",
]

class GroupService:
    def get_categories(self):
        return GROUP_CATEGORIES

    def create_group(self, user_id, data):
        name = data.get('name')
        description = data.get('description')
        category = data.get('category')
        is_private = data.get('isPrivate', False)
        meeting_schedule = data.get('meetingSchedule')

        if not name or not description or not category:
            raise ValidationError('Name, description, and category are required')

        group = Group(
            name=name,
            description=description,
            category=category,
            organizer_id=user_id,
            is_private=is_private,
            meeting_schedule=meeting_schedule
        )
        db.session.add(group)
        db.session.commit()

        # Auto-join as organizer
        membership = GroupMembership(group_id=group.id, user_id=user_id)
        db.session.add(membership)
        db.session.commit()

        logger.info("group_created", group_id=group.id, organizer_id=user_id)

        data = group.to_dict()
        data['isMember'] = True
        return data

    def get_all_groups(self, user_id):
        groups = Group.query.all()
        result = []
        for group in groups:
            data = group.to_dict()
            data['isMember'] = GroupMembership.query.filter_by(
                group_id=group.id, user_id=user_id
            ).first() is not None
            result.append(data)
        return result

    def get_group(self, group_id, user_id):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')

        data = group.to_dict(include_messages=True)
        data['isMember'] = GroupMembership.query.filter_by(
            group_id=group_id, user_id=user_id
        ).first() is not None
        return data

    def join_group(self, group_id, user_id):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')

        if group.is_private:
            raise ForbiddenError('This is a private group')

        existing = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if existing:
            raise ValidationError('Already a member')

        membership = GroupMembership(group_id=group_id, user_id=user_id)
        db.session.add(membership)
        db.session.commit()
        logger.info("group_joined", group_id=group_id, user_id=user_id)

        data = group.to_dict()
        data['isMember'] = True
        return data

    def leave_group(self, group_id, user_id):
        membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            raise NotFoundError('Not a member of this group')

        db.session.delete(membership)
        db.session.commit()
        logger.info("group_left", group_id=group_id, user_id=user_id)

        group = Group.query.get(group_id)
        data = group.to_dict()
        data['isMember'] = False
        return data

    def delete_group(self, group_id, user_id):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')

        if group.organizer_id != user_id:
            raise ForbiddenError('Only the organizer can delete this group')

        db.session.delete(group)
        db.session.commit()
        logger.info("group_deleted", group_id=group_id, user_id=user_id)

    def send_message(self, group_id, user_id, data):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')

        membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            raise ForbiddenError('Must be a member to send messages')

        text = data.get('text')
        if not text:
            raise ValidationError('Message text is required')

        message = GroupMessage(
            group_id=group_id,
            author_id=user_id,
            text=text
        )
        db.session.add(message)
        db.session.commit()
        logger.info("group_message_sent", group_id=group_id, user_id=user_id, message_id=message.id)
        return message

    def get_messages(self, group_id, user_id, limit=50):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')

        membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            raise ForbiddenError('Must be a member to view messages')

        # Fetch the most recent `limit` messages (newest first), then
        # reverse to chronological order for display — GroupChat renders
        # top-to-bottom and auto-scrolls to the bottom on load.
        recent = GroupMessage.query.filter_by(group_id=group_id).order_by(
            GroupMessage.created_at.desc()
        ).limit(limit).all()
        return list(reversed(recent))

    def edit_message(self, group_id, message_id, user_id, data):
        message = GroupMessage.query.filter_by(id=message_id, group_id=group_id).first()
        if not message:
            raise NotFoundError('Message not found')

        if message.author_id != user_id:
            raise ForbiddenError('You can only edit your own messages')

        text = data.get('text')
        if not text:
            raise ValidationError('Message text is required')

        message.text = text
        message.edited_at = datetime.now(timezone.utc)
        db.session.commit()
        logger.info("group_message_edited", group_id=group_id, message_id=message_id, user_id=user_id)
        return message

    def delete_message(self, group_id, message_id, user_id):
        message = GroupMessage.query.filter_by(id=message_id, group_id=group_id).first()
        if not message:
            raise NotFoundError('Message not found')

        group = Group.query.get(group_id)
        is_author = message.author_id == user_id
        is_organizer = group is not None and group.organizer_id == user_id
        if not (is_author or is_organizer):
            raise ForbiddenError('You can only delete your own messages')

        db.session.delete(message)
        db.session.commit()
        logger.info("group_message_deleted", group_id=group_id, message_id=message_id, user_id=user_id)

group_service = GroupService()
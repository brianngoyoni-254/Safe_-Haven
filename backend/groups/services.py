from app.groups.models import Group, GroupMembership, GroupMessage
from app.extensions import db
from app.core.exceptions import ValidationError, NotFoundError, ForbiddenError

class GroupService:
    def create_group(self, user_id, data):
        name = data.get('name')
        description = data.get('description')
        category = data.get('category')
        is_private = data.get('is_private', False)
        meeting_schedule = data.get('meeting_schedule')
        
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
        
        return group
    
    def get_all_groups(self, user_id):
        groups = Group.query.all()
        result = []
        for group in groups:
            data = group.to_dict()
            data['is_member'] = GroupMembership.query.filter_by(
                group_id=group.id, user_id=user_id
            ).first() is not None
            result.append(data)
        return result
    
    def get_group(self, group_id, user_id):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')
        
        data = group.to_dict(include_messages=True)
        data['is_member'] = GroupMembership.query.filter_by(
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
        return group
    
    def leave_group(self, group_id, user_id):
        membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            raise NotFoundError('Not a member of this group')
        
        db.session.delete(membership)
        db.session.commit()
    
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
        return message
    
    def get_messages(self, group_id, user_id, limit=50):
        group = Group.query.get(group_id)
        if not group:
            raise NotFoundError('Group not found')
        
        membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            raise ForbiddenError('Must be a member to view messages')
        
        return GroupMessage.query.filter_by(group_id=group_id).order_by(
            GroupMessage.created_at.desc()
        ).limit(limit).all()

group_service = GroupService()
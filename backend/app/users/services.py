from app.users.models import User
from app.auth.schemas import UpdateUserSchema
from app.extensions import db
from app.core.exceptions import ValidationError
from marshmallow import ValidationError as MarshmallowError
import logging

logger = logging.getLogger(__name__)

class UserService:
    def update_user(self, user, data):
        """Update user profile"""
        try:
            schema = UpdateUserSchema()
            validated = schema.load(data)
        except MarshmallowError as e:
            raise ValidationError('Invalid user data', details=e.messages)
        
        if 'username' in validated:
            existing = User.query.filter_by(username=validated['username']).first()
            if existing and existing.id != user.id:
                raise ValidationError('Username already taken')
            user.username = validated['username']
        
        if 'sobriety_start' in validated:
            user.sobriety_start = validated['sobriety_start']
        
        if 'goals' in validated:
            user.goals = validated['goals']
        
        db.session.commit()
        logger.info(f'User updated: {user.email}')
        return user

user_service = UserService()
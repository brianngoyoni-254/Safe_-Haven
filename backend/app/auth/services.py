from app.users.models import User
from app.auth.schemas import RegisterSchema, LoginSchema
from app.extensions import db
from app.core.tokens import generate_tokens
from app.core.exceptions import ValidationError, UnauthorizedError, ConflictError
from marshmallow import ValidationError as MarshmallowError
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def register_user(self, data):
        """Register a new user"""
        try:
            schema = RegisterSchema()
            validated = schema.load(data)
        except MarshmallowError as e:
            raise ValidationError('Invalid registration data', details=e.messages)
        
        if User.query.filter_by(email=validated['email']).first():
            raise ConflictError('Email already registered')
        
        if User.query.filter_by(username=validated['username']).first():
            raise ConflictError('Username already taken')
        
        user = User(
            email=validated['email'],
            username=validated['username'],
            sobriety_start=validated.get('sobriety_start')
        )
        user.set_password(validated['password'])
        
        db.session.add(user)
        db.session.commit()
        
        logger.info(f'User registered: {user.email}')
        return user
    
    def login_user(self, data):
        """Authenticate user and generate tokens"""
        try:
            schema = LoginSchema()
            validated = schema.load(data)
        except MarshmallowError as e:
            raise ValidationError('Invalid login data', details=e.messages)
        
        user = User.query.filter_by(email=validated['email']).first()
        if not user or not user.check_password(validated['password']):
            raise UnauthorizedError('Invalid email or password')
        
        tokens = generate_tokens(user.id)
        tokens['user'] = user.to_dict()
        
        logger.info(f'User logged in: {user.email}')
        return tokens

    def login_with_firebase(self, id_token):
        """Verify a Firebase ID token, find-or-create the matching user,
        and issue our own JWT pair."""
        from firebase_admin import auth as firebase_auth
        from app.core.firebase_admin_setup import init_firebase_admin

        if not id_token:
            raise UnauthorizedError('Missing Firebase token')

        init_firebase_admin()
        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception:
            raise UnauthorizedError('Invalid or expired Firebase token')

        firebase_uid = decoded['uid']
        email = decoded.get('email')
        name = decoded.get('name') or (email.split('@')[0] if email else 'user')

        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        if not user and email:
            user = User.query.filter_by(email=email).first()
            if user:
                user.firebase_uid = firebase_uid

        if not user:
            user = User(
                email=email,
                username=name,
                firebase_uid=firebase_uid,
            )
            db.session.add(user)

        db.session.commit()

        tokens = generate_tokens(user.id)
        tokens['user'] = user.to_dict()

        logger.info(f'User logged in via Firebase: {user.email}')
        return tokens

auth_service = AuthService()
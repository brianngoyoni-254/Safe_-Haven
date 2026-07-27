from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import timedelta

def generate_tokens(user_id):
    """Generate access and refresh tokens for a user"""
    access_token = create_access_token(
        identity=user_id,
        expires_delta=timedelta(hours=1)
    )
    refresh_token = create_refresh_token(
        identity=user_id,
        expires_delta=timedelta(days=30)
    )
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }
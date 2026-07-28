from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
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
        'refresh_token': refresh_token,
        'expires_in': 3600,
    }

def refresh_access_token(refresh_token):
    """
    Validate a refresh token and issue a new access token.
    Returns the new access token string, or None if the refresh
    token is invalid/expired.
    """
    try:
        decoded = decode_token(refresh_token)
    except Exception:
        return None

    if decoded.get('type') != 'refresh':
        return None

    user_id = decoded['sub']
    return create_access_token(
        identity=user_id,
        expires_delta=timedelta(hours=1)
    )
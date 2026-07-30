from flask import Blueprint, request, jsonify
from app.auth.services import auth_service
from app.core.exceptions import AppError
from app.core.tokens import refresh_access_token
from app.core.decorators import login_required
import structlog

auth_bp = Blueprint('auth', __name__)
logger = structlog.get_logger(__name__)

REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60  # 30 days, matches create_refresh_token's expiry


def _set_refresh_cookie(response, refresh_token, remember_me=True):
    """Attach the refresh_token cookie.

    remember_me=True  -> persistent cookie (Max-Age set), survives browser restarts.
    remember_me=False -> session cookie (no Max-Age/Expires at all), cleared
                          by the browser as soon as it's fully closed.
    """
    cookie_kwargs = dict(
        httponly=True,
        secure=False,       # set True once served over HTTPS in production
        samesite='Lax',
        path='/api/auth',
    )
    if remember_me:
        cookie_kwargs['max_age'] = REFRESH_COOKIE_MAX_AGE
    response.set_cookie('refresh_token', refresh_token, **cookie_kwargs)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [email, password, username]
          properties:
            email: { type: string, format: email, example: "user@example.com" }
            password:
              type: string
              format: password
              description: "8+ chars, must include upper, lower, digit, and special character"
            username: { type: string, minLength: 2, maxLength: 80 }
            sobriety_start: { type: string, format: date, example: "2025-01-15" }
    responses:
      201:
        description: User registered successfully
        schema:
          type: object
          properties:
            success: { type: boolean }
            message: { type: string }
            data: { type: object }
      400:
        description: Validation error (e.g. weak password, malformed email)
      409:
        description: Email or username already taken
    """
    try:
        data = request.get_json()
        user = auth_service.register_user(data)
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': user.to_dict()
        }), 201
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e),
            'details': getattr(e, 'details', {})
        }), e.status_code
    except Exception as e:
        logger.error("registration_error", error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login with email and password
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [email, password]
          properties:
            email: { type: string, format: email }
            password: { type: string, format: password }
            rememberMe:
              type: boolean
              default: true
              description: "true = persistent refresh_token cookie (30 days); false = session cookie"
    responses:
      200:
        description: Login successful. Sets an httpOnly refresh_token cookie; returns an access token in the body.
        schema:
          type: object
          properties:
            success: { type: boolean }
            message: { type: string }
            data:
              type: object
              properties:
                access_token: { type: string }
                user: { type: object }
      401:
        description: Invalid email or password
    """
    try:
        data = request.get_json()
        remember_me = data.get('rememberMe', True)
        result = auth_service.login_user(data)

        refresh_token = result.pop('refresh_token')

        response = jsonify({
            'success': True,
            'message': 'Login successful',
            'data': result
        })
        _set_refresh_cookie(response, refresh_token, remember_me)
        return response, 200
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error("login_error", error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """
    Exchange the refresh_token cookie for a new access token
    ---
    tags:
      - Auth
    description: >
      Reads the httpOnly `refresh_token` cookie set by /login or /firebase.
      Swagger UI cannot attach httpOnly cookies for you — this endpoint is
      easiest to test from the browser dev console or an HTTP client that
      shares your login session, not from the /apidocs page directly.
    responses:
      200:
        description: New access token issued
        schema:
          type: object
          properties:
            success: { type: boolean }
            data:
              type: object
              properties:
                access_token: { type: string }
                expires_in: { type: integer, example: 3600 }
      400:
        description: Refresh token cookie missing
      401:
        description: Refresh token invalid or expired
    """
    try:
        refresh_token = request.cookies.get('refresh_token')
        if not refresh_token:
            return jsonify({'success': False, 'error': 'Refresh token required'}), 400

        new_token = refresh_access_token(refresh_token)
        if not new_token:
            return jsonify({'success': False, 'error': 'Invalid refresh token'}), 401

        return jsonify({
            'success': True,
            'data': {
                'access_token': new_token,
                'expires_in': 3600,
            }
        }), 200
    except Exception as e:
        logger.error("refresh_error", error=str(e), exc_info=True)
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@auth_bp.route('/firebase', methods=['POST'])
def firebase_login():
    """
    Login or register via a Firebase ID token
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [token]
          properties:
            token: { type: string, description: "Firebase ID token from the client SDK" }
            rememberMe: { type: boolean, default: true }
    responses:
      200:
        description: Login successful (user created on first sign-in). Sets refresh_token cookie.
        schema:
          type: object
          properties:
            success: { type: boolean }
            message: { type: string }
            data:
              type: object
              properties:
                access_token: { type: string }
                user: { type: object }
      401:
        description: Token missing, invalid, expired, revoked, or user disabled
    """
    try:
        data = request.get_json()
        id_token = data.get('token')
        remember_me = data.get('rememberMe', True)
        result = auth_service.login_with_firebase(id_token)

        refresh_token = result.pop('refresh_token')

        response = jsonify({
            'success': True,
            'message': 'Login successful',
            'data': result
        })
        _set_refresh_cookie(response, refresh_token, remember_me)
        return response, 200
    except AppError as e:
        return jsonify({
            'success': False,
            'error': e.__class__.__name__,
            'message': str(e)
        }), e.status_code
    except Exception as e:
        logger.error("firebase_login_error", error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@login_required
def session_check(current_user):
    """
    Check whether the current access token is still valid
    ---
    tags:
      - Auth
    security:
      - BearerAuth: []
    responses:
      200:
        description: Token is valid; current user returned
        schema:
          type: object
          properties:
            success: { type: boolean }
            data: { type: object }
      401:
        description: Token missing, invalid, or expired
    """
    return jsonify({
        'success': True,
        'data': current_user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Log out and clear the refresh token cookie
    ---
    tags:
      - Auth
    responses:
      200:
        description: Logged out successfully; refresh_token cookie cleared
        schema:
          type: object
          properties:
            success: { type: boolean }
            message: { type: string }
    """
    try:
        response = jsonify({
            'success': True,
            'message': 'Logged out successfully'
        })
        response.set_cookie(
            'refresh_token',
            '',
            httponly=True,
            secure=False,       # keep in sync with the login/firebase routes
            samesite='Lax',
            max_age=0,
            expires=0,
            path='/api/auth',
        )
        return response, 200
    except Exception as e:
        logger.error("logout_error", error=str(e), exc_info=True)
        return jsonify({
            'success': False,
            'error': 'InternalServerError',
            'message': 'An unexpected error occurred'
        }), 500
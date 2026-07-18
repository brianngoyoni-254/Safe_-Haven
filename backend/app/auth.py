from flask import Blueprint, request, jsonify, current_app

from werkzeug.security import generate_password_hash, check_password_hash

from .store import (
    create_user,
    get_user_by_email,
    get_user_by_firebase_uid,
    link_firebase_uid,
    public_user,
)
from .tokens import (
    issue_access_token,
    issue_refresh_token,
    decode_refresh_token,
    revoke_refresh_token,
)
from .firebase_admin_setup import verify_firebase_token

auth_bp = Blueprint("auth", __name__)


def _set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        current_app.config["REFRESH_COOKIE_NAME"],
        refresh_token,
        httponly=True,
        secure=current_app.config["COOKIE_SECURE"],
        samesite="Lax",
        max_age=current_app.config["REFRESH_EXPIRES_DAYS"] * 24 * 60 * 60,
        path="/api/auth",
    )


def _issue_session_response(user):
    """Builds the {user, access_token, expires_in} body AND sets the
    httpOnly refresh cookie on the response."""
    access_token, expires_in = issue_access_token(user.id)
    refresh_token = issue_refresh_token(user.id)

    body = {
        "user": public_user(user),
        "access_token": access_token,
        "expires_in": expires_in,
    }
    response = jsonify(body)
    _set_refresh_cookie(response, refresh_token)
    return response


# POST /api/auth/register 
@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    username = (data.get("username") or "").strip()

    if not email or not password or not username:
        return jsonify({"error": "email, password, and username are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if get_user_by_email(email):
        return jsonify({"error": "An account with that email already exists"}), 409

    user = create_user(
        email=email,
        username=username,
        password_hash=generate_password_hash(password),
    )
    return _issue_session_response(user), 201


# POST /api/auth/login 
@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = get_user_by_email(email)
    if not user or not user.password_hash:
        return jsonify({"error": "Incorrect email or password"}), 401
    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Incorrect email or password"}), 401

    return _issue_session_response(user)


#  POST /api/auth/firebase 
# Exchanges a Firebase ID token (from Google sign-in or Firebase email/pass)
# for our own app session (access token + refresh cookie).
@auth_bp.post("/firebase")
def firebase_exchange():
    data = request.get_json(silent=True) or {}
    id_token = data.get("token")
    username = (data.get("username") or "").strip() or None

    if not id_token:
        return jsonify({"error": "Missing Firebase token"}), 400

    try:
        decoded = verify_firebase_token(id_token)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    firebase_uid = decoded["uid"]
    email = (decoded.get("email") or "").strip().lower()

    user = get_user_by_firebase_uid(firebase_uid)

    if not user and email:
        # Maybe they previously registered with email/password and are now
        # signing in with Google using the same email — link the accounts.
        user = get_user_by_email(email)
        if user:
            link_firebase_uid(user, firebase_uid)

    if not user:
        user = create_user(
            email=email,
            username=username or decoded.get("name") or email.split("@")[0] or "Anonymous",
            firebase_uid=firebase_uid,
        )

    return _issue_session_response(user)


# POST /api/auth/refresh 
@auth_bp.post("/refresh")
def refresh():
    refresh_token = request.cookies.get(current_app.config["REFRESH_COOKIE_NAME"])
    if not refresh_token:
        return jsonify({"error": "No refresh token"}), 401

    try:
        payload = decode_refresh_token(refresh_token)
    except Exception:
        return jsonify({"error": "Invalid or expired refresh token"}), 401

    from .store import get_user_by_id

    user = get_user_by_id(payload["sub"])
    if not user:
        return jsonify({"error": "User not found"}), 401

    access_token, expires_in = issue_access_token(user.id)
    return jsonify({"access_token": access_token, "expires_in": expires_in})


# POST /api/auth/logout 
@auth_bp.post("/logout")
def logout():
    refresh_token = request.cookies.get(current_app.config["REFRESH_COOKIE_NAME"])
    if refresh_token:
        revoke_refresh_token(refresh_token)

    response = jsonify({"ok": True})
    response.set_cookie(
        current_app.config["REFRESH_COOKIE_NAME"],
        "",
        expires=0,
        httponly=True,
        secure=current_app.config["COOKIE_SECURE"],
        samesite="Lax",
        path="/api/auth",
    )
    return response


# POST /api/auth/forgot-password 
@auth_bp.post("/forgot-password")
def forgot_password():
    return jsonify({
        "message": "Password resets are currently handled client-side via Firebase."
    }), 501


# POST /api/auth/reset-password 
@auth_bp.post("/reset-password")
def reset_password():
    return jsonify({
        "message": "Password resets are currently handled client-side via Firebase."
    }), 501
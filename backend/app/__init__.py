import os
from flask import Flask
from flask_cors import CORS

from .auth import auth_bp
from .users import users_bp


def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET"] = os.environ.get("JWT_SECRET", "dev-secret-change-me")
    app.config["JWT_ACCESS_EXPIRES_SECONDS"] = int(
        os.environ.get("JWT_ACCESS_EXPIRES_SECONDS", 900)  # 15 min
    )
    app.config["REFRESH_COOKIE_NAME"] = "refresh_token"
    app.config["REFRESH_EXPIRES_DAYS"] = int(
        os.environ.get("REFRESH_EXPIRES_DAYS", 30)
    )

    # In dev (http://localhost), cookies need SameSite=Lax/None depending on
    # whether frontend + backend are on the same origin via the Vite proxy.
    # Since the Vite proxy makes everything look same-origin in the browser,
    # Lax + Secure=False is fine for local dev.
    app.config["COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"

    # Frontend origin allowed to make credentialed requests.
    frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    CORS(
        app,
        resources={r"/api/*": {"origins": frontend_origin}},
        supports_credentials=True,
    )

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
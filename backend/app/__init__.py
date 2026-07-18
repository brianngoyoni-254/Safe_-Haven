from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Frontend (Vite) runs on a different origin than the API in dev, and we
    # send an httpOnly refresh cookie — that requires an explicit origin
    # (not "*") plus supports_credentials=True, or the browser blocks it.
    CORS(
        app,
        supports_credentials=True,
        origins=app.config["CORS_ALLOWED_ORIGINS"],
    )

    db.init_app(app)
    migrate.init_app(app, db)

    from . import models  # noqa: F401 — ensures models are registered before migrations

    from .auth import auth_bp
    from .users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    return app
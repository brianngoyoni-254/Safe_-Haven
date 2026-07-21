from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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
    from .checkins import checkins_bp
    from .milestones import milestones_bp
    from .resources import resources_bp
    from .library import library_bp
    from .video_library import video_library_bp
    from .groups import groups_bp
    from .seed_groups import seed_groups_command

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(checkins_bp, url_prefix="/api/checkins")
    app.register_blueprint(milestones_bp, url_prefix="/api/milestones")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(library_bp, url_prefix="/api/library")
    app.register_blueprint(video_library_bp, url_prefix="/api/video-library")
    app.register_blueprint(groups_bp, url_prefix="/api/groups")

    app.cli.add_command(seed_groups_command)

    return app
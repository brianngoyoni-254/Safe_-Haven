import time
import uuid

import structlog
from flask import Flask, g, request
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate
from .logging_config import setup_logging
from .errors import register_error_handlers

logger = structlog.get_logger(__name__)


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    setup_logging(app)          # console + rotating file handlers, structlog wiring
    register_error_handlers(app)  # catch-all JSON error responses (see errors.py)

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
    from .journal import journal_bp
    from .crisis import crisis_bp
    from .donations import donations_bp
    from .payments import payments_bp
    from seed.seed_groups import seed_groups_command
    from seed.seed_crisis import seed_crisis_command

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(checkins_bp, url_prefix="/api/checkins")
    app.register_blueprint(milestones_bp, url_prefix="/api/milestones")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(library_bp, url_prefix="/api/library")
    app.register_blueprint(video_library_bp, url_prefix="/api/video-library")
    app.register_blueprint(groups_bp, url_prefix="/api/groups")
    app.register_blueprint(journal_bp, url_prefix="/api/journal")
    app.register_blueprint(crisis_bp, url_prefix="/api/crisis")
    app.register_blueprint(donations_bp, url_prefix="/api/donations")
    # url_prefix must match MPESA_CALLBACK_URL's path in .env exactly
    app.register_blueprint(payments_bp, url_prefix="/api/payments")

    app.cli.add_command(seed_groups_command)
    app.cli.add_command(seed_crisis_command)

    @app.before_request
    def _log_request_start():
        request_id = uuid.uuid4().hex[:12]  # short, unique enough per-request
        g.request_id = request_id
        g.request_start = time.monotonic()  # for duration_ms below

        # Binds these fields onto every log line for the rest of THIS
        # request — including ones logged deep inside store.py — without
        # having to pass request_id around as an argument everywhere.
        structlog.contextvars.clear_contextvars()  # drop previous request's bindings
        structlog.contextvars.bind_contextvars(
            request_id=request_id, method=request.method, path=request.path
        )
        logger.info("request_start")

    @app.after_request
    def _log_request_end(response):
        duration_ms = (time.monotonic() - g.get("request_start", time.monotonic())) * 1000
        logger.info(
            "request_end",
            status_code=response.status_code,
            duration_ms=round(duration_ms, 1),
        )
        response.headers["X-Request-Id"] = g.get("request_id", "-")  # lets a client report a bad request by this id
        return response

    return app
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from app.config.env import Config
from app.extensions import db, jwt, cors, migrate
from app.middleware.error_handler import register_error_handlers
from app.middleware.logging import setup_logging

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)
    
    # Setup logging
    setup_logging(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    from app.auth.routes import auth_bp
    from app.users.routes import users_bp
    from app.donations.routes import donations_bp
    from app.journal.routes import journal_bp
    from app.crisis.routes import crisis_bp
    from app.checkins.routes import checkins_bp
    from app.groups.routes import groups_bp
    from app.milestones.routes import milestones_bp
    from app.dashboard.routes import dashboard_bp
    from app.library.routes import library_bp
    from app.resources.routes import resources_bp
    from app.videos.routes import videos_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(donations_bp, url_prefix='/api/donations')
    app.register_blueprint(journal_bp, url_prefix='/api/journal')
    app.register_blueprint(crisis_bp, url_prefix='/api/crisis')
    app.register_blueprint(checkins_bp, url_prefix='/api/checkins')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(milestones_bp, url_prefix='/api/milestones')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(library_bp, url_prefix='/api/library')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(videos_bp, url_prefix='/api/videos')
    
    return app
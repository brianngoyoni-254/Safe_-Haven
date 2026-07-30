from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flasgger import Swagger

from app.config.env import Config
from app.extensions import db, jwt, cors, migrate
from app.core.firebase_admin_setup import init_firebase_admin
from app.middleware.error_handler import register_error_handlers
from app.middleware.logging import setup_logging

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Treat "/api/x" and "/api/x/" as the same route instead of redirecting
    # between them. Without this, a request to "/api/groups" (no trailing
    # slash, matching how the frontend calls it) gets a 308 redirect to
    # "/api/groups/" — and browsers drop the Authorization header when
    # following a redirect, so the redirected request lands unauthenticated
    # and 401s even though the original request had a valid token.
    app.url_map.strict_slashes = False
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}},
        supports_credentials=True,
    )
    migrate.init_app(app, db)
    init_firebase_admin()
    
    # Setup logging
    setup_logging(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    from app.auth.routes import auth_bp
    from app.users.routes import users_bp
    from donations.routes import donations_bp
    from journal.routes import journal_bp
    from crisis.routes import crisis_bp
    from app.checkins.routes import checkins_bp
    from groups.routes import groups_bp
    from app.milestones.routes import milestones_bp
    from dashboard.routes import dashboard_bp
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

    # Swagger / OpenAPI docs 
    # Served at /apidocs/. Every route decorated with `security: - BearerAuth: []`
    # in its YAML docstring will show a padlock in the UI — paste an access
    # token there (no "Bearer " prefix needed, Flasgger adds it) to test
    # authenticated endpoints directly from the docs page.
    app.config['SWAGGER'] = {
        'title': 'Safe Haven API',
        'uiversion': 3,
        'specs_route': '/apidocs/',
    }
    swagger_template = {
        'info': {
            'title': 'Safe Haven API',
            'description': 'Recovery support platform API — auth, check-ins, milestones, resources, and donations.',
            'version': '1.0.0',
        },
        'securityDefinitions': {
            'BearerAuth': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header',
                'description': "JWT access token. Paste ONLY the token — Flasgger prefixes 'Bearer ' automatically.",
            }
        },
    }
    Swagger(app, template=swagger_template)

    return app
import structlog

from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

logger = structlog.get_logger(__name__)


class APIError(Exception):
    """Raise this for any expected, client-facing error."""

    def __init__(self, message, status_code=400, payload=None):
        super().__init__(message)
        self.message = message          # sent back as {"error": message}
        self.status_code = status_code  # HTTP status to respond with
        self.payload = payload          # optional extra fields, e.g. {"field": "category"}

    def to_dict(self):
        body = {"error": self.message}
        if self.payload:
            body.update(self.payload)
        return body


def register_error_handlers(app):

    # Errors raised on purpose, e.g. raise APIError("Group not found", 404)
    @app.errorhandler(APIError)
    def handle_api_error(err):
        logger.warning("api_error", status_code=err.status_code, message=err.message)
        return jsonify(err.to_dict()), err.status_code

    # Bad request body/query params caught by a marshmallow schema
    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        logger.warning("validation_error", fields=err.messages)
        return jsonify({"error": "Validation failed", "fields": err.messages}), 400

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        # Covers 404 Not Found, 405 Method Not Allowed, etc. — anything
        # Flask/Werkzeug raises on its own before your route code runs
        logger.warning("http_exception", status_code=err.code, description=err.description)
        return jsonify({"error": err.description or err.name}), err.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(err):
        # Anything not caught above is an actual bug. Log the full
        # traceback for yourself, but never leak internals (stack traces,
        # SQL, file paths) back to the client.
        logger.exception("unhandled_exception", error=str(err))
        return jsonify({"error": "Internal server error"}), 500
import logging
import os
import sys
import time
import uuid

import structlog
from flask import request, g

SENSITIVE_KEYS = {
    'password', 'confirm_password', 'old_password', 'new_password',
    'token', 'refresh_token', 'access_token',
}


def _redact(data):
    """Recursively redact sensitive keys from a dict before logging."""
    if not isinstance(data, dict):
        return data
    redacted = {}
    for key, value in data.items():
        if key.lower() in SENSITIVE_KEYS:
            redacted[key] = '***REDACTED***'
        elif isinstance(value, dict):
            redacted[key] = _redact(value)
        else:
            redacted[key] = value
    return redacted


def configure_structlog(app):
    """Configure structlog + stdlib logging for the Flask app.

    Console output is human-readable/colorized; logs/app.log gets
    one JSON object per line. File logging is skipped in production
    (e.g. Render) since the filesystem there is ephemeral and stdout
    is already captured as the service's logs.
    """
    log_level = app.config.get('LOG_LEVEL', 'INFO')

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout)
    root_logger.addHandler(console_handler)

    log_file = app.config.get('LOG_FILE', 'logs/app.log')
    file_handler = None
    if app.config.get('FLASK_ENV') != 'production':
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        root_logger.addHandler(file_handler)

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt='iso'),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    structlog.configure(
        processors=shared_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    console_handler.setFormatter(structlog.stdlib.ProcessorFormatter(
        processor=structlog.dev.ConsoleRenderer(colors=True),
        foreign_pre_chain=shared_processors,
    ))
    if file_handler:
        file_handler.setFormatter(structlog.stdlib.ProcessorFormatter(
            processor=structlog.processors.JSONRenderer(),
            foreign_pre_chain=shared_processors,
        ))

    _register_request_hooks(app)


# Alias so `from app.middleware.logging import setup_logging` keeps working
# for any existing code (e.g. middleware/__init__.py) that expects this name.
setup_logging = configure_structlog


def _register_request_hooks(app):
    logger = structlog.get_logger('request')

    @app.before_request
    def start_request_log():
        g.request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
        g.request_start_time = time.time()
        structlog.contextvars.bind_contextvars(request_id=g.request_id)

        logger.info('request_started', method=request.method, path=request.path)

        if request.is_json:
            body = request.get_json(silent=True) or {}
            logger.debug('request_body', body=_redact(body))

    @app.after_request
    def end_request_log(response):
        duration_ms = None
        if hasattr(g, 'request_start_time'):
            duration_ms = round((time.time() - g.request_start_time) * 1000, 2)

        logger.info(
            'request_finished',
            method=request.method,
            path=request.path,
            status=response.status_code,
            duration_ms=duration_ms,
        )
        return response

    @app.teardown_request
    def clear_request_context(exc=None):
        structlog.contextvars.clear_contextvars()
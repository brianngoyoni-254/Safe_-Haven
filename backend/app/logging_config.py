
import logging
import os
from logging.handlers import RotatingFileHandler

import structlog

# logs/ lives at the project root, one level up from app/
LOG_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs"
)
LOG_FILE = os.path.join(LOG_DIR, "app.log")


def setup_logging(app):
    os.makedirs(LOG_DIR, exist_ok=True)

    log_level = getattr(
        logging, app.config.get("LOG_LEVEL", "INFO").upper(), logging.INFO
    )
    use_json = app.config.get("LOG_JSON", False)

    # Processors that run on EVERY log line, structlog or plain stdlib alike.
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    # Wires structlog's BoundLogger into stdlib logging so both share the
    # same handlers/formatter below (rather than structlog logging separately)
    structlog.configure(
        processors=shared_processors
        + [structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Pretty/colored for humans in dev; one JSON object per line in prod
    renderer = (
        structlog.processors.JSONRenderer()
        if use_json
        else structlog.dev.ConsoleRenderer()
    )
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    # Same formatter on both handlers so console and file always agree
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=5
    )
    file_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.handlers.clear()  # avoid duplicate lines if create_app() runs twice (tests)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    # Quiet down noisy third-party loggers unless you're specifically
    # debugging them
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    structlog.get_logger(__name__).info(
        "logging_configured",
        level=logging.getLevelName(log_level),
        log_file=LOG_FILE,
        json=use_json,
    )
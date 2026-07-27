import logging
from logging.handlers import RotatingFileHandler
import os
from flask import request
import json

def setup_logging(app):
    """Configure logging for the application"""
    
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10485760,
        backupCount=10
    )
    file_handler.setLevel(logging.DEBUG)
    
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.DEBUG)
    
    @app.before_request
    def log_request_info():
        app.logger.info(f'Request: {request.method} {request.path}')
        if request.json:
            log_data = {k: v for k, v in request.json.items() if k not in ['password']}
            app.logger.debug(f'Body: {json.dumps(log_data)}')
    
    @app.after_request
    def log_response_info(response):
        app.logger.info(f'Response: {response.status_code} {request.path}')
        return response
class AppError(Exception):
    """Base application exception"""
    status_code = 500
    
    def __init__(self, message, status_code=None, details=None):
        super().__init__(message)
        if status_code:
            self.status_code = status_code
        self.details = details or {}

class ValidationError(AppError):
    """Validation error"""
    status_code = 400

class NotFoundError(AppError):
    """Resource not found error"""
    status_code = 404

class UnauthorizedError(AppError):
    """Authentication error"""
    status_code = 401

class ForbiddenError(AppError):
    """Authorization error"""
    status_code = 403

class ConflictError(AppError):
    """Resource conflict error"""
    status_code = 409
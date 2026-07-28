from marshmallow import Schema, fields, validate, ValidationError
import re

PASSWORD_RULES = (
    (r'[A-Z]', 'one uppercase letter'),
    (r'[a-z]', 'one lowercase letter'),
    (r'\d', 'one number'),
    (r'[!@#$%^&*()\-_=+\[\]{};:\'",.<>/?`~\\|]', 'one special character'),
)

def validate_password_strength(password):
    """Enforce a strong password: 8+ chars, upper, lower, digit, special char."""
    missing = [desc for pattern, desc in PASSWORD_RULES if not re.search(pattern, password)]
    if missing:
        raise ValidationError(
            f"Password must contain at least {', '.join(missing)}."
        )
    if len(password.encode('utf-8')) > 72:
        # bcrypt only hashes the first 72 bytes; anything beyond that is
        # silently ignored, so reject longer passwords outright rather than
        # letting the user believe the whole thing was checked.
        raise ValidationError('Password must be 72 characters or fewer.')

def validate_phone(phone):
    """Validate Kenyan phone number"""
    if phone:
        phone = re.sub(r'^0', '254', phone)
        pattern = r'^254(7|1)\d{8}$'
        if not re.match(pattern, phone):
            raise ValidationError('Invalid phone number. Must be in format 07XXXXXXXX or 01XXXXXXXX')
    return phone

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(
        required=True,
        validate=[validate.Length(min=8), validate_password_strength],
    )
    username = fields.Str(required=True, validate=validate.Length(min=2, max=80))
    sobriety_start = fields.Date(allow_none=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class UpdateUserSchema(Schema):
    username = fields.Str(validate=validate.Length(min=2, max=80))
    sobriety_start = fields.Date(allow_none=True)
    goals = fields.Str(allow_none=True)
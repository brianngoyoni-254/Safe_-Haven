from marshmallow import Schema, fields, validate, ValidationError
import re

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
    password = fields.Str(required=True, validate=validate.Length(min=8))
    username = fields.Str(required=True, validate=validate.Length(min=2, max=80))
    sobriety_start = fields.Date(allow_none=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class UpdateUserSchema(Schema):
    username = fields.Str(validate=validate.Length(min=2, max=80))
    sobriety_start = fields.Date(allow_none=True)
    goals = fields.Str(allow_none=True)
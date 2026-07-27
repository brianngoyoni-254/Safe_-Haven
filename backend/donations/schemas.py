from marshmallow import Schema, fields, validate, ValidationError
import re

def validate_phone(phone):
    """Validate Kenyan phone number"""
    phone = re.sub(r'^0', '254', phone)
    pattern = r'^254(7|1)\d{8}$'
    if not re.match(pattern, phone):
        raise ValidationError('Invalid phone number. Must be in format 07XXXXXXXX or 01XXXXXXXX')
    return phone

class DonationSchema(Schema):
    amount = fields.Int(required=True, validate=validate.Range(min=1))
    phone = fields.Str(required=True, validate=validate_phone)
    name = fields.Str(allow_none=True, validate=validate.Length(max=120))
    message = fields.Str(allow_none=True)
    anonymous = fields.Bool(missing=False)
    frequency = fields.Str(missing='once', validate=validate.OneOf(['once', 'monthly']))
# app/schemas.py
from marshmallow import Schema, fields, validate, validates, ValidationError

# Users 

class UserSchema(Schema):
    """Matches public_user() in store.py."""
    id = fields.Str(dump_only=True)
    email = fields.Email(dump_only=True)
    username = fields.Str(dump_only=True)
    sobriety_start = fields.Date(dump_only=True, allow_none=True)
    goals = fields.Str(dump_only=True, allow_none=True)
    created_at = fields.DateTime(dump_only=True)


class ProfileUpdateInputSchema(Schema):
    """Matches the payload Profile.jsx's handleSave() sends."""
    username = fields.Str(required=True, validate=validate.Length(min=1))
    sobrietyStart = fields.Date(
        required=False, allow_none=True, load_default=None, data_key="sobrietyStart"
    )
    goals = fields.Str(required=False, allow_none=True, load_default=None)

    @validates("sobrietyStart")
    def not_in_future(self, value, **kwargs):
        from datetime import date
        if value and value > date.today():
            raise ValidationError("sobrietyStart cannot be in the future")


class RegisterInputSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    username = fields.Str(required=True, validate=validate.Length(min=1))


class LoginInputSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class SobrietyStartInputSchema(Schema):
    recoveryStartDate = fields.Date(required=True, format="%Y-%m-%d")

    @validates("recoveryStartDate")
    def not_in_future(self, value, **kwargs):
        from datetime import date
        if value > date.today():
            raise ValidationError("recoveryStartDate cannot be in the future")


# Check-ins 

class CheckInSchema(Schema):
    """Matches public_checkin() in store.py."""
    id = fields.Str(dump_only=True)
    date = fields.Date(dump_only=True)
    mood = fields.Int(dump_only=True)
    craving_level = fields.Int(data_key="cravingLevel", dump_only=True)
    sober_today = fields.Bool(data_key="soberToday", dump_only=True)
    notes = fields.Str(dump_only=True, allow_none=True)
    created_at = fields.DateTime(data_key="createdAt", dump_only=True, allow_none=True)
    updated_at = fields.DateTime(data_key="updatedAt", dump_only=True, allow_none=True)


class CheckInInputSchema(Schema):
    """Replaces _validate_payload() in checkins.py."""
    mood = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    cravingLevel = fields.Int(
        required=True, validate=validate.Range(min=1, max=5), data_key="cravingLevel"
    )
    soberToday = fields.Bool(required=True, data_key="soberToday")
    notes = fields.Str(required=False, allow_none=True, load_default=None)

    @validates("notes")
    def strip_notes(self, value, **kwargs):
        # marshmallow validates don't mutate; do the .strip() after load()
        # in the route, e.g. cleaned["notes"] = (cleaned.get("notes") or "").strip() or None
        pass


# Milestones 

class MilestoneSchema(Schema):
    """Matches public_milestone() in store.py."""
    days = fields.Int(dump_only=True)
    achieved_at = fields.Date(data_key="achievedAt", dump_only=True)


# Resources 

class ResourceSchema(Schema):
    """Matches public_resource() in store.py."""
    id = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)
    type = fields.Str(dump_only=True)
    county = fields.Str(dump_only=True)
    region = fields.Str(dump_only=True)
    address = fields.Str(dump_only=True)
    phone = fields.Str(dump_only=True, allow_none=True)
    website = fields.Str(dump_only=True, allow_none=True)
    lat = fields.Float(dump_only=True)
    lng = fields.Float(dump_only=True)


# Reading library 

class LibraryReadingSchema(Schema):
    title = fields.Str(dump_only=True)
    publisher = fields.Str(dump_only=True)
    format = fields.Str(dump_only=True)
    desc = fields.Str(dump_only=True)
    url = fields.Str(dump_only=True)


class LibraryTopicSchema(Schema):
    """Matches public_library_topic() in store.py."""
    id = fields.Str(dump_only=True)
    label = fields.Str(dump_only=True)
    icon = fields.Str(dump_only=True)
    color = fields.Str(dump_only=True)
    bg = fields.Str(dump_only=True)
    badge = fields.Str(dump_only=True)
    blurb = fields.Str(dump_only=True)
    readings = fields.List(fields.Nested(LibraryReadingSchema), dump_only=True)


# Video library 

class VideoSchema(Schema):
    title = fields.Str(dump_only=True)
    publisher = fields.Str(dump_only=True)
    format = fields.Str(dump_only=True)
    duration = fields.Str(dump_only=True)
    desc = fields.Str(dump_only=True)
    url = fields.Str(dump_only=True)


class VideoTopicSchema(Schema):
    """Matches public_video_topic() in store.py."""
    id = fields.Str(dump_only=True)
    label = fields.Str(dump_only=True)
    icon = fields.Str(dump_only=True)
    color = fields.Str(dump_only=True)
    bg = fields.Str(dump_only=True)
    badge = fields.Str(dump_only=True)
    blurb = fields.Str(dump_only=True)
    videos = fields.List(fields.Nested(VideoSchema), dump_only=True)


# Groups 

class GroupSchema(Schema):
    """Matches public_group() in store.py. Note: memberCount/isMember are
    computed in store.py (not plain model columns), so if you dump directly
    from a Group ORM object you'll need to attach those as attributes first,
    or keep building this dict in store.py and just use GroupSchema for
    request validation instead."""
    id = fields.Str(dump_only=True)
    name = fields.Str(dump_only=True)
    description = fields.Str(dump_only=True)
    category = fields.Str(dump_only=True)
    organizer_id = fields.Str(data_key="organizerId", dump_only=True)
    organizer_name = fields.Method("get_organizer_name", data_key="organizerName")
    member_count = fields.Int(data_key="memberCount", dump_only=True)
    is_private = fields.Bool(data_key="isPrivate", dump_only=True)
    meeting_schedule = fields.Str(data_key="meetingSchedule", dump_only=True, allow_none=True)
    is_member = fields.Bool(data_key="isMember", dump_only=True)

    def get_organizer_name(self, obj):
        organizer = getattr(obj, "organizer", None)
        return organizer.username if organizer else None


class GroupInputSchema(Schema):
    """Replaces the manual field-pulling in groups.py's create()."""
    name = fields.Str(required=True, validate=validate.Length(min=1))
    description = fields.Str(required=True, validate=validate.Length(min=1))
    category = fields.Str(required=True)  # cross-check against CATEGORIES in the route
    isPrivate = fields.Bool(load_default=False, data_key="isPrivate")
    meetingSchedule = fields.Str(
        required=False, allow_none=True, load_default=None, data_key="meetingSchedule"
    )


class GroupMessageSchema(Schema):
    """Matches public_message() in store.py."""
    id = fields.Str(dump_only=True)
    author_id = fields.Str(data_key="authorId", dump_only=True)
    author_name = fields.Method("get_author_name", data_key="authorName")
    text = fields.Str(dump_only=True)
    created_at = fields.DateTime(data_key="createdAt", dump_only=True, allow_none=True)
    edited_at = fields.DateTime(data_key="editedAt", dump_only=True, allow_none=True)

    def get_author_name(self, obj):
        author = getattr(obj, "author", None)
        return author.username if author else None


class GroupMessageInputSchema(Schema):
    text = fields.Str(required=True, validate=validate.Length(min=1))
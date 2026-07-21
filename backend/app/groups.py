from flask import Blueprint, request, jsonify, g

from .decorators import require_auth
from .store import (
    create_group,
    get_group,
    list_groups,
    list_my_groups,
    delete_group,
    join_group,
    leave_group,
    public_group,
    get_messages,
    create_message,
    get_message,
    edit_message,
    delete_message,
    public_message,
)

groups_bp = Blueprint("groups", __name__)

# Keep in sync with the category badge styling in Groups.jsx (CATEGORY_STYLES
# stays client-side -- it's presentational). This list is the source of truth
# for both what the frontend offers in its dropdowns and what the server
# accepts on create.
CATEGORIES = [
    "Substance Recovery",
    "Alcohol Recovery",
    "Mental Health",
    "Grief & Loss",
    "Family Support",
    "LGBTQ+ Recovery",
    "Women's Group",
    "Men's Group",
    "Young Adults (18-30)",
    "Faith-Based",
    "Trauma & PTSD",
    "General Wellness",
]


# GET /api/groups/categories -- no auth needed, just static reference data
@groups_bp.get("/categories")
def categories():
    return jsonify(CATEGORIES)


# GET /api/groups -- all groups, newest first
@groups_bp.get("")
@require_auth
def list_all():
    groups = list_groups()
    return jsonify([public_group(gr, g.user.id) for gr in groups])


# GET /api/groups/mine -- groups the current user belongs to
@groups_bp.get("/mine")
@require_auth
def list_mine():
    groups = list_my_groups(g.user.id)
    return jsonify([public_group(gr, g.user.id) for gr in groups])


# GET /api/groups/<id> -- single group detail
@groups_bp.get("/<group_id>")
@require_auth
def get_one(group_id):
    group = get_group(group_id)
    if not group:
        return jsonify({"error": "Group not found"}), 404
    return jsonify(public_group(group, g.user.id))


# POST /api/groups -- creates the group and auto-joins the organizer
# (create_group() in store.py already handles the membership row)
@groups_bp.post("")
@require_auth
def create():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    category = data.get("category")
    is_private = bool(data.get("isPrivate", False))
    meeting_schedule = (data.get("meetingSchedule") or "").strip() or None

    if not name or not description:
        return jsonify({"error": "name and description are required"}), 400
    if category not in CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    group = create_group(
        organizer_id=g.user.id,
        name=name,
        description=description,
        category=category,
        is_private=is_private,
        meeting_schedule=meeting_schedule,
    )
    return jsonify(public_group(group, g.user.id)), 201


# POST /api/groups/<id>/join -- idempotent (store.join_group no-ops if already a member)
@groups_bp.post("/<group_id>/join")
@require_auth
def join(group_id):
    if not get_group(group_id):
        return jsonify({"error": "Group not found"}), 404
    group = join_group(group_id, g.user.id)
    return jsonify(public_group(group, g.user.id))


# POST /api/groups/<id>/leave
@groups_bp.post("/<group_id>/leave")
@require_auth
def leave(group_id):
    if not get_group(group_id):
        return jsonify({"error": "Group not found"}), 404
    group = leave_group(group_id, g.user.id)
    return jsonify(public_group(group, g.user.id))


# DELETE /api/groups/<id> -- organizer only
@groups_bp.delete("/<group_id>")
@require_auth
def delete(group_id):
    group = get_group(group_id)
    if not group:
        return jsonify({"error": "Group not found"}), 404
    if group.organizer_id != g.user.id:
        return jsonify({"error": "Only the organizer can delete this group"}), 403

    delete_group(group)
    return "", 204


# GET /api/groups/<id>/messages -- matches Groups.jsx rendering the thread
# top-to-bottom (get_messages() in store.py already returns oldest-first)
@groups_bp.get("/<group_id>/messages")
@require_auth
def messages(group_id):
    if not get_group(group_id):
        return jsonify({"error": "Group not found"}), 404
    return jsonify([public_message(m) for m in get_messages(group_id)])


# POST /api/groups/<id>/messages
@groups_bp.post("/<group_id>/messages")
@require_auth
def send_message(group_id):
    if not get_group(group_id):
        return jsonify({"error": "Group not found"}), 404

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    message = create_message(group_id, g.user.id, text)
    return jsonify(public_message(message)), 201


# PATCH /api/groups/<id>/messages/<msg_id> -- author only
@groups_bp.patch("/<group_id>/messages/<message_id>")
@require_auth
def update_message(group_id, message_id):
    existing = get_message(message_id)
    if not existing or existing.group_id != group_id:
        return jsonify({"error": "Message not found"}), 404
    if existing.author_id != g.user.id:
        return jsonify({"error": "You can only edit your own messages"}), 403

    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    message = edit_message(message_id, g.user.id, text)
    return jsonify(public_message(message))


# DELETE /api/groups/<id>/messages/<msg_id> -- author only
@groups_bp.delete("/<group_id>/messages/<message_id>")
@require_auth
def remove_message(group_id, message_id):
    existing = get_message(message_id)
    if not existing or existing.group_id != group_id:
        return jsonify({"error": "Message not found"}), 404
    if existing.author_id != g.user.id:
        return jsonify({"error": "You can only delete your own messages"}), 403

    delete_message(message_id, g.user.id)
    return "", 204
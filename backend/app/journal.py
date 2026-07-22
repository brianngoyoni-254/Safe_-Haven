from flask import Blueprint, request, jsonify, g

from .decorators import require_auth
from .store import (
    list_journal_entries,
    get_journal_entry,
    create_journal_entry,
    update_journal_entry,
    delete_journal_entry,
    public_journal_entry,
)

journal_bp = Blueprint("journal", __name__)


def _validate_payload(data):
    """Returns (cleaned_values, error_message). error_message is None on
    success. Mirrors _validate_payload() in checkins.py. mood and tags are
    optional, matching EntryForm on the frontend (mood can be left unset,
    tags can be an empty list)."""
    title = data.get("title")
    content = data.get("content")
    mood = data.get("mood")
    tags = data.get("tags")

    if not isinstance(title, str) or not title.strip():
        return None, "title is required"
    if not isinstance(content, str) or not content.strip():
        return None, "content is required"

    if mood is not None and (not isinstance(mood, int) or not (1 <= mood <= 5)):
        return None, "mood must be an integer between 1 and 5"

    if tags is None:
        tags = []
    elif not isinstance(tags, list) or not all(isinstance(t, str) for t in tags):
        return None, "tags must be a list of strings"
    else:
        tags = [t.strip().lower() for t in tags if t.strip()]

    return {
        "title": title.strip(),
        "content": content.strip(),
        "mood": mood,
        "tags": tags,
    }, None


# GET /api/journal — matches listJournalEntries() on the frontend; newest
# entries first.
@journal_bp.get("")
@require_auth
def list_entries():
    entries = list_journal_entries(g.user.id)
    return jsonify([public_journal_entry(e) for e in entries])


# POST /api/journal — matches createJournalEntry(payload)
@journal_bp.post("")
@require_auth
def create():
    data = request.get_json(silent=True) or {}
    cleaned, error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    entry = create_journal_entry(g.user.id, **cleaned)
    return jsonify(public_journal_entry(entry)), 201


# PATCH /api/journal/<id> — matches updateJournalEntry(id, patch)
@journal_bp.patch("/<entry_id>")
@require_auth
def update(entry_id):
    entry = get_journal_entry(entry_id, g.user.id)
    if not entry:
        return jsonify({"error": "Journal entry not found"}), 404

    data = request.get_json(silent=True) or {}
    cleaned, error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    entry = update_journal_entry(entry, **cleaned)
    return jsonify(public_journal_entry(entry))


# DELETE /api/journal/<id> — matches deleteJournalEntry(id)
@journal_bp.delete("/<entry_id>")
@require_auth
def remove(entry_id):
    entry = get_journal_entry(entry_id, g.user.id)
    if not entry:
        return jsonify({"error": "Journal entry not found"}), 404

    delete_journal_entry(entry)
    return jsonify({"success": True})
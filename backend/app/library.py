from flask import Blueprint, jsonify

from .decorators import require_auth
from .store import list_library_topics, public_library_topic

library_bp = Blueprint("library", __name__)


# GET /api/library — curated reading-library topics + articles, matching
# libraryApi.list() on the frontend. Replaces the static LIBRARY_TOPICS
# array that previously lived in Resources.jsx.
@library_bp.get("")
@require_auth
def list_library():
    topics = list_library_topics()
    return jsonify([public_library_topic(t) for t in topics])
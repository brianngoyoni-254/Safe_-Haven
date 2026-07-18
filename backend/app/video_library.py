from flask import Blueprint, jsonify

from .decorators import require_auth
from .store import list_video_topics, public_video_topic

video_library_bp = Blueprint("video_library", __name__)


# GET /api/video-library — curated video-library topics + videos, matching
# videoLibraryApi.list() on the frontend. Replaces the static VIDEO_LIBRARY
# array that previously lived in Resources.jsx.
@video_library_bp.get("")
@require_auth
def list_video_library():
    topics = list_video_topics()
    return jsonify([public_video_topic(t) for t in topics])
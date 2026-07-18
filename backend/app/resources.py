from flask import Blueprint, jsonify, request

from .decorators import require_auth
from .store import list_resources, public_resource

resources_bp = Blueprint("resources", __name__)


# GET /api/resources — rehab-centre directory, matching resourcesApi.list()
# on the frontend. Optional query params:
#   ?type=Residential|Outpatient|Counseling|Public   (default: all types)
#   ?region=<region name>                            (default: all regions)
#   ?q=<free text>                                   (matches name/address/county/type)
# Replaces the static RESOURCES array that previously lived in Resources.jsx.
@resources_bp.get("")
@require_auth
def list_resources_route():
    type_filter = request.args.get("type")
    region_filter = request.args.get("region")
    query = request.args.get("q")

    resources = list_resources(type_filter, region_filter, query)
    return jsonify([public_resource(r) for r in resources])
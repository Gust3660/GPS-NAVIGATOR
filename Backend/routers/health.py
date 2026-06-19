import os

from fastapi import APIRouter

from core.red_zones import RED_ZONE_DATA, get_red_zones
from core.state import vehicles_state


router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "astar_manhattan_grid + osrm/inegi_restriction_fallback",
        "google_traffic_api": bool(os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_ROUTES_API_KEY")),
        "red_zones": len(get_red_zones()),
        "red_zone_source": RED_ZONE_DATA.get("source"),
        "vehicles": len(vehicles_state),
    }

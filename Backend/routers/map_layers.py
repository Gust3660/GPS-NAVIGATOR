from fastapi import APIRouter

from core.red_zones import RED_ZONE_DATA, RED_ZONES


router = APIRouter()


@router.get("/red-zones")
async def get_red_zones():
    return {
        "source": RED_ZONE_DATA.get("source"),
        "method": RED_ZONE_DATA.get("method"),
        "zones": RED_ZONES,
    }

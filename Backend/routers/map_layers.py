from fastapi import APIRouter, HTTPException

from core.red_zones import RED_ZONE_DATA, get_red_zones as list_red_zones
from schemas import RedZoneInput
from storage import create_custom_red_zone, delete_custom_red_zone, update_custom_red_zone


router = APIRouter()


@router.get("/red-zones")
async def get_red_zones():
    return {
        "source": RED_ZONE_DATA.get("source"),
        "method": RED_ZONE_DATA.get("method"),
        "safety_radius_km": 5,
        "zones": list_red_zones(),
    }


@router.post("/red-zones", status_code=201)
async def create_red_zone(zone: RedZoneInput):
    create_custom_red_zone(zone.model_dump())
    return {"zones": list_red_zones()}


@router.put("/red-zones/{zone_id}")
async def update_red_zone(zone_id: int, zone: RedZoneInput):
    updated = update_custom_red_zone(zone_id, zone.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Zona roja no encontrada")
    return {"zones": list_red_zones()}


@router.delete("/red-zones/{zone_id}")
async def delete_red_zone(zone_id: int):
    if not delete_custom_red_zone(zone_id):
        raise HTTPException(status_code=404, detail="Zona roja no encontrada")
    return {"zones": list_red_zones()}

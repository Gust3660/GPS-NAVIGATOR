from typing import Optional

from fastapi import APIRouter

from route_logic import geocode_local
from schemas import GeocodeQuery
from services.geocoding import local_place_suggestions, search_photon_places


router = APIRouter()


@router.post("/geocode")
async def geocode(q: GeocodeQuery):
    result = await geocode_local(q.query)
    if result:
        lat, lng, display_name = result
        return {
            "lat": lat,
            "lng": lng,
            "display_name": display_name,
            "engine": "local_dictionary",
        }

    return {"error": "Direccion no encontrada en el catalogo local"}


@router.get("/geocode/suggest")
async def geocode_suggest(query: str, lat: Optional[float] = None, lng: Optional[float] = None):
    value = query.strip()
    if len(value) < 3:
        return []

    try:
        return search_photon_places(value, lat=lat, lng=lng)
    except Exception:
        return local_place_suggestions(value)

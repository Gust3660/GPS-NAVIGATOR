from fastapi import APIRouter

from services.weather import fetch_current_weather


router = APIRouter()


@router.get("/weather/current")
async def get_current_weather(lat: float, lng: float):
    try:
        return fetch_current_weather(lat, lng)
    except Exception as exc:
        return {"error": f"No se pudo consultar clima real: {exc}"}

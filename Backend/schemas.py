from typing import Any, Optional

from pydantic import BaseModel, Field


class TelemetryData(BaseModel):
    vehicle_id: str
    lat: float
    lng: float
    speed: Optional[float] = None
    fuel_level: Optional[float] = None
    timestamp: float


class StopPoint(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    stops: list[StopPoint] = Field(default_factory=list)
    vehicle_consumption: float = 8.0
    fuel_price_per_liter: float = 23.5
    toll_cost_mxn: float = 0.0
    avoid_tolls: bool = False
    avoid_highways: bool = False
    vehicle_type: str = "Auto"


class GeocodeQuery(BaseModel):
    query: str


class RedZoneInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    risk_level: str = Field(default="alto", min_length=2, max_length=40)


class StoredRoute(BaseModel):
    name: str
    originName: Optional[str] = "Punto de partida"
    origin: dict[str, float]
    destination: dict[str, float]
    form: dict[str, Any]
    distance: float = 0
    duration: float = 0
    tollCost: float = 0
    vehicle: Optional[str] = None
    batteryLevel: Optional[float] = None

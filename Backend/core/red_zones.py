import json
import math
from pathlib import Path

from storage import list_custom_red_zones


RED_ZONES_PATH = Path(__file__).resolve().parents[1] / "red_zones.json"

with RED_ZONES_PATH.open("r", encoding="utf-8") as f:
    RED_ZONE_DATA = json.load(f)
    BASE_RED_ZONES = RED_ZONE_DATA["zones"]


def circle_polygon(lat: float, lng: float, radius_km: float = 0.5, points: int = 24):
    lat_scale = 111.32
    lng_scale = max(111.32 * math.cos(math.radians(lat)), 0.01)
    return [
        [
            lng + (radius_km / lng_scale) * math.cos(2 * math.pi * index / points),
            lat + (radius_km / lat_scale) * math.sin(2 * math.pi * index / points),
        ]
        for index in range(points)
    ]


def get_red_zones():
    base = [
        {
            **zone,
            "id": f"base-{index}",
            "editable": False,
            "safety_radius_km": 5,
        }
        for index, zone in enumerate(BASE_RED_ZONES)
    ]
    custom = [
        {
            "id": zone["id"],
            "name": zone["name"],
            "center": {"lat": zone["lat"], "lng": zone["lng"]},
            "polygon": circle_polygon(zone["lat"], zone["lng"]),
            "source": "Zona agregada por el usuario",
            "risk_level": zone["risk_level"],
            "editable": True,
            "safety_radius_km": 5,
        }
        for zone in list_custom_red_zones()
    ]
    return [*base, *custom]


RED_ZONES = BASE_RED_ZONES

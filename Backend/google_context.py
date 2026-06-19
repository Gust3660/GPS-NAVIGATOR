import json
import os
import re
import urllib.request
from datetime import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"
MEXICO_CITY_CENTER = (19.432608, -99.133209)


def _duration_to_seconds(value):
    if not value:
        return None
    match = re.match(r"^(\d+(?:\.\d+)?)s$", value)
    if not match:
        return None
    return float(match.group(1))


def _haversine_km(a, b):
    from math import asin, cos, radians, sin, sqrt

    lat1, lng1 = a
    lat2, lng2 = b
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    lat1 = radians(lat1)
    lat2 = radians(lat2)
    h = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    return 6371 * 2 * asin(sqrt(h))


def _local_traffic_context(origin, destination):
    try:
        now = datetime.now(ZoneInfo("America/Mexico_City"))
    except ZoneInfoNotFoundError:
        now = datetime.now()
    hour = now.hour + now.minute / 60
    weekday = now.weekday()
    near_cdmx = (
        _haversine_km(origin, MEXICO_CITY_CENTER) < 70
        or _haversine_km(destination, MEXICO_CITY_CENTER) < 70
    )

    factor = 1.0
    if weekday < 5:
        if 7 <= hour < 10:
            factor = 1.38 if near_cdmx else 1.18
        elif 17 <= hour < 20.5:
            factor = 1.45 if near_cdmx else 1.22
        elif 13 <= hour < 16:
            factor = 1.16 if near_cdmx else 1.08
    elif weekday == 5 and 11 <= hour < 15:
        factor = 1.18 if near_cdmx else 1.08
    elif weekday == 6 and 18 <= hour < 21:
        factor = 1.14 if near_cdmx else 1.05

    if factor >= 1.35:
        level = "pesado"
    elif factor >= 1.12:
        level = "moderado"
    else:
        level = "normal"

    return {
        "source": "local_time_model",
        "traffic_factor": factor,
        "traffic_level": level,
        "warning": "GOOGLE_MAPS_API_KEY no configurada; trafico recalculado con modelo local por hora y zona.",
    }


def get_google_traffic_context(origin, destination):
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_ROUTES_API_KEY")
    if not api_key:
        return _local_traffic_context(origin, destination)

    body = {
        "origin": {
            "location": {
                "latLng": {"latitude": origin[0], "longitude": origin[1]}
            }
        },
        "destination": {
            "location": {
                "latLng": {"latitude": destination[0], "longitude": destination[1]}
            }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "computeAlternativeRoutes": False,
        "languageCode": "es-MX",
        "units": "METRIC",
    }

    request = urllib.request.Request(
        GOOGLE_ROUTES_URL,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "routes.duration,routes.staticDuration",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=6) as response:
            data = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        return {
            "source": "local_model",
            "traffic_factor": 1.0,
            "traffic_level": "normal",
            "warning": f"No se pudo consultar Google Routes: {exc}",
        }

    route = (data.get("routes") or [{}])[0]
    traffic_seconds = _duration_to_seconds(route.get("duration"))
    static_seconds = _duration_to_seconds(route.get("staticDuration"))
    if not traffic_seconds or not static_seconds:
        return {
            "source": "google_routes",
            "traffic_factor": 1.0,
            "traffic_level": "normal",
            "warning": "Google Routes no regreso duraciones de trafico suficientes.",
        }

    factor = max(1.0, min(traffic_seconds / max(static_seconds, 1), 2.5))
    if factor >= 1.45:
        level = "pesado"
    elif factor >= 1.18:
        level = "moderado"
    else:
        level = "normal"

    return {
        "source": "google_routes",
        "traffic_factor": factor,
        "traffic_level": level,
        "warning": None,
    }

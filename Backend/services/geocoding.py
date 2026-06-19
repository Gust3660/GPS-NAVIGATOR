import json
import urllib.parse
import urllib.request
from typing import Optional

from route_logic import geocode_local


def search_photon_places(query: str, lat: Optional[float] = None, lng: Optional[float] = None, limit: int = 6):
    params = {
        "q": query,
        "limit": max(1, min(limit, 10)),
    }
    if lat is not None and lng is not None:
        params["lat"] = lat
        params["lon"] = lng

    url = f"https://photon.komoot.io/api/?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "GPS-Location/1.0"},
    )

    with urllib.request.urlopen(request, timeout=8) as response:
        data = json.loads(response.read().decode("utf-8"))

    suggestions = []
    for feature in data.get("features", []):
        coords = feature.get("geometry", {}).get("coordinates", [])
        props = feature.get("properties", {})
        if len(coords) < 2:
            continue

        parts = [
            props.get("name"),
            props.get("street"),
            props.get("city"),
            props.get("state"),
            props.get("country"),
        ]
        display_name = ", ".join(dict.fromkeys(part for part in parts if part))
        if not display_name:
            display_name = props.get("osm_value") or "Lugar sin nombre"

        suggestions.append({
            "lat": coords[1],
            "lng": coords[0],
            "display_name": display_name,
            "name": props.get("name") or display_name,
            "country": props.get("country"),
            "engine": "photon_osm",
        })

    return suggestions


def local_place_suggestions(value: str, limit: int = 6):
    normalized = value.lower()
    local = []
    for key, (place_lat, place_lng, display) in geocode_local.__globals__["LOCAL_PLACES"].items():
        if normalized in key or key in normalized:
            local.append({
                "lat": place_lat,
                "lng": place_lng,
                "display_name": display,
                "name": display,
                "country": "Mexico",
                "engine": "local_dictionary",
            })
    return local[:limit]

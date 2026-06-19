import json
import urllib.parse
import urllib.request
from typing import Optional


def weather_code_label(code: Optional[int]):
    labels = {
        0: "Despejado",
        1: "Mayormente despejado",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Niebla",
        48: "Niebla con escarcha",
        51: "Llovizna ligera",
        53: "Llovizna",
        55: "Llovizna intensa",
        61: "Lluvia ligera",
        63: "Lluvia",
        65: "Lluvia intensa",
        80: "Chubascos ligeros",
        81: "Chubascos",
        82: "Chubascos intensos",
        95: "Tormenta",
        96: "Tormenta con granizo",
        99: "Tormenta severa",
    }
    return labels.get(code, "Condicion no clasificada")


def fetch_current_weather(lat: float, lng: float):
    params = urllib.parse.urlencode({
        "latitude": lat,
        "longitude": lng,
        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
        ]),
        "timezone": "auto",
        "temperature_unit": "celsius",
        "wind_speed_unit": "kmh",
        "precipitation_unit": "mm",
    })
    url = f"https://api.open-meteo.com/v1/forecast?{params}"
    request = urllib.request.Request(url, headers={"User-Agent": "GPS-Location/1.0"})

    with urllib.request.urlopen(request, timeout=8) as response:
        data = json.loads(response.read().decode("utf-8"))

    current = data.get("current") or {}
    units = data.get("current_units") or {}
    weather_code = current.get("weather_code")
    return {
        "lat": lat,
        "lng": lng,
        "source": "Open-Meteo",
        "time": current.get("time"),
        "timezone": data.get("timezone"),
        "condition": weather_code_label(weather_code),
        "weather_code": weather_code,
        "temperature_c": current.get("temperature_2m"),
        "apparent_temperature_c": current.get("apparent_temperature"),
        "humidity_percent": current.get("relative_humidity_2m"),
        "precipitation_mm": current.get("precipitation"),
        "rain_mm": current.get("rain"),
        "cloud_cover_percent": current.get("cloud_cover"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "wind_direction_degrees": current.get("wind_direction_10m"),
        "wind_gusts_kmh": current.get("wind_gusts_10m"),
        "is_day": bool(current.get("is_day")),
        "units": units,
    }

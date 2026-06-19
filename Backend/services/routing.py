from typing import Any

from core.red_zones import RED_ZONE_DATA, RED_ZONES
from google_context import get_google_traffic_context
from inegi_routing import route_with_inegi, sakbe_vehicle_code
from route_logic import (
    calculate_road_network_route,
    intersecting_red_zones,
    manhattan_distance,
)
from schemas import RouteRequest


def apply_traffic_context(duration: float, traffic_context: dict[str, Any]):
    factor = max(1.0, min(float(traffic_context.get("traffic_factor", 1.0)), 2.5))
    return duration * factor, {
        "traffic_factor": factor,
        "traffic_source": traffic_context.get("source", "local_model"),
        "traffic_level": traffic_context.get("traffic_level", "normal"),
    }


def inegi_result_to_route(origin, destination, stops, inegi_result, traffic_context):
    exempt_points = [origin, *stops, destination]
    unresolved = [
        zone["name"]
        for zone in intersecting_red_zones(
            inegi_result["coords"],
            RED_ZONES,
            exempt_points=exempt_points,
        )
    ]
    duration, traffic = apply_traffic_context(inegi_result["duration"], traffic_context)

    return {
        "polyline": inegi_result["polyline"],
        "distance": inegi_result["distance"],
        "duration": duration,
        "waypoints": stops,
        "route_model": inegi_result["engine"],
        "optimization": {
            "models": ["inegi_sakbe_road_graph", "red_zone_penalty"],
            **inegi_result.get("optimization", {}),
            **traffic,
        },
        "avoided_zones": [],
        "unresolved_zones": unresolved,
        "risk_score": min(100, 22 + len(unresolved) * 32 + int((traffic["traffic_factor"] - 1) * 35)),
        "toll_cost": inegi_result.get("toll_cost"),
        "toll_source": inegi_result.get("toll_source"),
        "toll_corridors": inegi_result.get("toll_corridors", []),
        "toll_vehicle_type": inegi_result.get("toll_vehicle_type"),
        "toll_vehicle_code": inegi_result.get("toll_vehicle_code"),
        "warning": inegi_result.get("warning"),
        "route_steps": [
            {
                "instruction": "Inicia la ruta",
                "street": "Punto de partida",
                "distance_meters": 0,
                "duration_seconds": 0,
            },
            {
                "instruction": "Sigue la ruta calculada por INEGI Sakbe",
                "street": "Red vial INEGI",
                "distance_meters": round(inegi_result["distance"], 1),
                "duration_seconds": round(duration, 1),
            },
            {
                "instruction": "Llega al destino",
                "street": "Destino",
                "distance_meters": 0,
                "duration_seconds": 0,
            },
        ],
    }


def get_toll_quote(origin, destination, req: RouteRequest):
    if req.avoid_tolls:
        return {
            "cost_mxn": 0.0,
            "source": "inegi_sakbe",
            "matched_corridors": [],
            "auto": False,
            "verified": True,
        }

    try:
        inegi_result = route_with_inegi(
            origin,
            destination,
            stops=[(stop.lat, stop.lng) for stop in req.stops],
            avoid_tolls=req.avoid_tolls,
            avoid_highways=req.avoid_highways,
            vehicle_type=req.vehicle_type,
        )
        return {
            "cost_mxn": float(inegi_result.get("toll_cost") or 0),
            "source": "inegi_sakbe",
            "matched_corridors": inegi_result.get("toll_corridors", []),
            "vehicle_type": inegi_result.get("toll_vehicle_type", req.vehicle_type),
            "vehicle_code": inegi_result.get("toll_vehicle_code", sakbe_vehicle_code(req.vehicle_type)),
            "auto": False,
            "verified": True,
            "warning": inegi_result.get("warning"),
        }
    except Exception as exc:
        return {
            "cost_mxn": None,
            "source": "inegi_sakbe_unavailable",
            "matched_corridors": [],
            "auto": False,
            "verified": False,
            "warning": f"Costo real de casetas no disponible en INEGI Sakbe: {exc}",
        }


def prefer_red_zone_detour(origin, destination, result, req, traffic_context):
    return result


def calculate_route_response(req: RouteRequest):
    origin = (req.origin_lat, req.origin_lng)
    destination = (req.dest_lat, req.dest_lng)
    stops = [(stop.lat, stop.lng) for stop in req.stops]
    traffic_context = get_google_traffic_context(origin, destination)
    try:
        result = calculate_road_network_route(
            origin,
            destination,
            RED_ZONES,
            stops=stops,
            avoid_tolls=req.avoid_tolls,
            avoid_highways=req.avoid_highways,
            traffic_context=traffic_context,
        )
    except Exception as osrm_exc:
        try:
            inegi_result = route_with_inegi(
                origin,
                destination,
                stops=stops,
                avoid_tolls=req.avoid_tolls,
                avoid_highways=req.avoid_highways,
                vehicle_type=req.vehicle_type,
            )
            result = inegi_result_to_route(origin, destination, stops, inegi_result, traffic_context)
            result["fallback_reason"] = f"OSRM no disponible: {osrm_exc}"
        except Exception as inegi_exc:
            return {
                "error": (
                    "No se pudo calcular una ruta real con motores viales. "
                    f"OSRM: {osrm_exc}; INEGI: {inegi_exc}"
                )
            }

    if result.get("error"):
        return {"error": result["error"]}

    result = prefer_red_zone_detour(origin, destination, result, req, traffic_context)

    distance_km = result["distance"] / 1000
    fuel_used = (req.vehicle_consumption / 100) * distance_km
    fuel_price = req.fuel_price_per_liter or 23.5
    fuel_cost = fuel_used * fuel_price
    toll_warning = None
    if result.get("toll_cost") is not None:
        toll_cost = 0 if req.avoid_tolls else float(result["toll_cost"])
        toll_source = result.get("toll_source", "inegi_sakbe")
        toll_corridors = [] if req.avoid_tolls else result.get("toll_corridors", [])
        toll_auto = False
        toll_verified = toll_source == "inegi_sakbe"
        toll_vehicle_type = result.get("toll_vehicle_type", req.vehicle_type)
        toll_vehicle_code = result.get("toll_vehicle_code", sakbe_vehicle_code(req.vehicle_type))
        toll_warning = result.get("warning")
    else:
        toll_quote = get_toll_quote(origin, destination, req)
        toll_cost = 0 if req.avoid_tolls else toll_quote["cost_mxn"]
        toll_source = toll_quote["source"]
        toll_corridors = toll_quote["matched_corridors"]
        toll_auto = toll_quote["auto"]
        toll_verified = toll_quote["verified"]
        toll_vehicle_type = toll_quote.get("vehicle_type", req.vehicle_type)
        toll_vehicle_code = toll_quote.get("vehicle_code", sakbe_vehicle_code(req.vehicle_type))
        toll_warning = toll_quote.get("warning")

    total_cost = fuel_cost + (toll_cost or 0)
    manhattan_km = manhattan_distance(
        req.origin_lat,
        req.origin_lng,
        req.dest_lat,
        req.dest_lng,
    )

    return {
        "polyline": result["polyline"],
        "distance_meters": round(result["distance"], 1),
        "distance_km": round(distance_km, 2),
        "duration_seconds": round(result["duration"], 1),
        "duration_minutes": round(result["duration"] / 60, 1),
        "toll_cost_mxn": round(toll_cost, 2) if toll_cost is not None else None,
        "toll_cost_source": toll_source,
        "toll_cost_auto": toll_auto,
        "toll_cost_verified": toll_verified,
        "toll_corridors": toll_corridors,
        "toll_vehicle_type": toll_vehicle_type,
        "toll_vehicle_code": toll_vehicle_code,
        "toll_warning": toll_warning,
        "fuel_consumption_liters": round(fuel_used, 2),
        "fuel_cost_mxn": round(fuel_cost, 2),
        "total_cost_mxn": round(total_cost, 2),
        "fuel_price_per_liter": round(fuel_price, 2),
        "manhattan_distance_km": round(manhattan_km, 2),
        "waypoints": result.get("waypoints", []),
        "route_steps": result.get("route_steps", []),
        "engine": result.get("route_model", "manhattan_detour_hill_climbing"),
        "optimization": result.get("optimization"),
        "google_warning": traffic_context.get("warning"),
        "red_zones": RED_ZONES,
        "red_zone_source": RED_ZONE_DATA.get("source"),
        "map_layers": {
            "red_zones": RED_ZONES,
            "traffic": {
                "level": result.get("optimization", {}).get("traffic_level", "normal"),
                "source": result.get("optimization", {}).get("traffic_source", "local_model"),
                "factor": result.get("optimization", {}).get("traffic_factor", 1.0),
            },
            "avoided_zones": result.get("avoided_zones", []),
        },
        "avoided_zones": result.get("avoided_zones", []),
        "unresolved_zones": result.get("unresolved_zones", []),
        "risk_score": result.get("risk_score", 32),
        "traffic_level": result.get("optimization", {}).get("traffic_level", "normal"),
        "route_restrictions": {
            "avoid_tolls": req.avoid_tolls,
            "avoid_highways": req.avoid_highways,
            "excluded_classes": result.get("optimization", {}).get("excluded_classes", []),
        },
        "fallback_reason": result.get("fallback_reason"),
        "summary": "Ruta por red vial real; OSRM como motor principal e INEGI Sakbe como respaldo en Mexico.",
    }

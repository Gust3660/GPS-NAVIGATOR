from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.state import alerts_history, vehicles_state, ws_connections
from route_logic import haversine_distance_m
from schemas import TelemetryData


router = APIRouter()


@router.post("/telemetry")
async def receive_telemetry(data: TelemetryData):
    vehicle_id = data.vehicle_id
    now = data.timestamp
    speed = data.speed

    if speed is None and vehicle_id in vehicles_state:
        last = vehicles_state[vehicle_id]
        dt = now - last["timestamp"]
        if dt > 0:
            dist_m = haversine_distance_m(last["lat"], last["lng"], data.lat, data.lng)
            speed = (dist_m / 1000) / (dt / 3600)
        else:
            speed = 0.0
    elif speed is None:
        speed = 0.0

    prev = vehicles_state.get(vehicle_id)
    vehicles_state[vehicle_id] = {
        "lat": data.lat,
        "lng": data.lng,
        "speed": speed,
        "fuel_level": data.fuel_level,
        "timestamp": now,
    }

    if data.fuel_level is not None and prev is not None:
        stopped = speed < 2
        fuel_drop = (
            prev.get("fuel_level") is not None
            and prev["fuel_level"] - data.fuel_level > 1.0
        )

        if stopped and fuel_drop:
            alert = {
                "vehicle_id": vehicle_id,
                "lat": data.lat,
                "lng": data.lng,
                "speed": round(speed, 1),
                "fuel_level": data.fuel_level,
                "timestamp": now,
                "message": (
                    f"Alerta: vehiculo {vehicle_id} detenido con descarga de "
                    f"combustible en {data.lat:.5f}, {data.lng:.5f}"
                ),
            }
            alerts_history.append(alert)

            for ws in ws_connections[:]:
                try:
                    await ws.send_json(alert)
                except Exception:
                    pass

    return {"status": "ok", "calculated_speed_kmh": round(speed, 1)}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    ws_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in ws_connections:
            ws_connections.remove(websocket)


@router.get("/alerts")
async def get_alerts():
    return alerts_history[-50:]

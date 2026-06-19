from fastapi import WebSocket


vehicles_state = {}
ws_connections: list[WebSocket] = []
alerts_history = []

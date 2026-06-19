import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import dashboard, geocoding, health, map_layers, routing, stored_routes, telemetry, weather
from storage import init_db


load_dotenv()

app = FastAPI(title="GPS LOCATION API", version="2.0.0")

frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


app.include_router(dashboard.router)
app.include_router(health.router)
app.include_router(routing.router)
app.include_router(geocoding.router)
app.include_router(telemetry.router)
app.include_router(map_layers.router)
app.include_router(weather.router)
app.include_router(stored_routes.router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8001")), reload=True)

from fastapi import APIRouter

from schemas import StoredRoute
from storage import list_routes, save_route


router = APIRouter()


@router.get("/routes/saved")
async def get_saved_routes():
    return list_routes("saved")


@router.post("/routes/saved")
async def create_saved_route(route: StoredRoute):
    return save_route("saved", route.dict())


@router.get("/routes/recent")
async def get_recent_routes():
    return list_routes("recent")


@router.post("/routes/recent")
async def create_recent_route(route: StoredRoute):
    return save_route("recent", route.dict())

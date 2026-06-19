from fastapi import APIRouter

from schemas import RouteRequest
from services.routing import calculate_route_response


router = APIRouter()


@router.post("/route")
async def get_route(req: RouteRequest):
    return calculate_route_response(req)

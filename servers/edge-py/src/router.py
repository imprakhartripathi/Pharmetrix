from fastapi import APIRouter

# Import route modules from controllers
from controllers.ping_controller import router as ping_router
from controllers.test_controller import router as test_router
from controllers.sensor_controller import router as sensor_router

# Central API router
api_router = APIRouter()

# Register controller routers here
api_router.include_router(ping_router)
api_router.include_router(test_router)
api_router.include_router(sensor_router)
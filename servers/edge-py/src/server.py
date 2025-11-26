import os
import sys
from typing import List

# Ensure the current src directory is importable for namespace-style packages
CURRENT_DIR = os.path.dirname(__file__)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

# services
from services.sensor_service import SensorService
from services.mqtt_service import MQTTService
from config import env

# Load environment variables
load_dotenv()

# Routers
from router import api_router  # noqa: E402


def create_app() -> FastAPI:
    app = FastAPI(title="SPIS Edge Backend", version="0.1.0")

    # Middleware setup
    allowed_origins: List[str] = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    app.include_router(api_router)

    # Application state: services and background tasks will be placed here
    app.state.sensor_service = SensorService()
    # MQTT service may not be available at import time (paho not installed),
    # instantiate it during startup.
    app.state.mqtt_service = None
    app.state._poller_task = None

    logger = logging.getLogger(__name__)

    @app.on_event("startup")
    async def _startup():
        # Instantiate and connect MQTT service if available
        try:
            app.state.mqtt_service = MQTTService()
            try:
                await app.state.mqtt_service.connect()
            except Exception as exc:  # pragma: no cover - runtime
                logger.warning("MQTT connection failed: %s", exc)
        except Exception as exc:
            # paho-mqtt might not be installed; keep app running without MQTT
            logger.info("MQTT service not available: %s", exc)

        # Start background poller
        async def _poller():
            try:
                while True:
                    readings = await app.state.sensor_service.read_all_sensors()
                    for sid, temp in readings.items():
                        topic = f"sensors/{sid}/temperature"
                        payload = {"temp": temp}
                        # publish but don't block the poll loop if publish fails
                        if getattr(app.state, "mqtt_service", None) is not None:
                            try:
                                await app.state.mqtt_service.publish(topic, payload)
                            except Exception as exc:  # log and continue
                                logger.debug("Failed to publish %s: %s", topic, exc)

                    await asyncio.sleep(env.POLL_INTERVAL)
            except asyncio.CancelledError:
                logger.info("Poller task cancelled")
                raise

        app.state._poller_task = asyncio.create_task(_poller())

    @app.on_event("shutdown")
    async def _shutdown():
        # Cancel poller
        task = getattr(app.state, "_poller_task", None)
        if task is not None:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        # Disconnect MQTT if present
        mqtt_svc = getattr(app.state, "mqtt_service", None)
        if mqtt_svc is not None:
            try:
                await mqtt_svc.disconnect()
            except Exception:
                pass

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    # Run using module path so that hot-reload works nicely
    uvicorn.run("src.server:app", host="0.0.0.0", port=port, reload=True)
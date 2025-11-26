from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request, status

from services.sensor_service import Sensor, SensorService
from utils.errors import NotFoundError, SensorReadError

router = APIRouter()


def _get_sensor_service(request: Request) -> SensorService:
    svc = getattr(request.app.state, "sensor_service", None)
    if svc is None:
        raise HTTPException(status_code=500, detail="SensorService not initialized")
    return svc


@router.post("/sensors", status_code=status.HTTP_201_CREATED)
async def add_sensor(payload: Dict[str, Any], request: Request):
    """Register a new sensor. Accepts JSON with `id` and optional `name` and `pin`."""
    if "id" not in payload:
        raise HTTPException(status_code=400, detail="Missing sensor id")

    sensor = Sensor(id=payload["id"], name=payload.get("name"), pin=payload.get("pin"))
    svc = _get_sensor_service(request)
    await svc.add_sensor(sensor)
    return {"status": "ok", "sensor": sensor.dict()}


@router.get("/sensors", response_model=List[Sensor])
async def list_sensors(request: Request):
    svc = _get_sensor_service(request)
    return await svc.list_sensors()


@router.get("/sensors/{sensor_id}")
async def read_sensor(sensor_id: str, request: Request):
    svc = _get_sensor_service(request)
    try:
        temp = await svc.read_sensor(sensor_id)
        return {"id": sensor_id, "temperature": temp}
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Sensor not found")
    except SensorReadError as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.delete("/sensors/{sensor_id}")
async def delete_sensor(sensor_id: str, request: Request):
    svc = _get_sensor_service(request)
    await svc.remove_sensor(sensor_id)
    return {"status": "ok"}


@router.post("/sensors/read-all")
async def read_all(request: Request):
    svc = _get_sensor_service(request)
    results = await svc.read_all_sensors()
    # convert None to null in JSON naturally
    return results

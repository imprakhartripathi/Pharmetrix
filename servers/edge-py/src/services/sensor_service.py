from __future__ import annotations

import asyncio
import logging
from typing import Dict, List, Optional

from pydantic import BaseModel

from config import env
from utils.file_reader import read_text
from utils.parser import parse_w1_slave
from utils.errors import NotFoundError, ParseError, SensorReadError

logger = logging.getLogger(__name__)


class Sensor(BaseModel):
    id: str
    name: Optional[str] = None
    pin: Optional[int] = None


class SensorService:
    """Manage DS18B20 sensors registered in-memory and read sensor values."""

    def __init__(self) -> None:
        self.sensors: Dict[str, Sensor] = {}
        self._lock = asyncio.Lock()

    async def add_sensor(self, sensor: Sensor) -> None:
        async with self._lock:
            self.sensors[sensor.id] = sensor
            logger.info("Added sensor %s", sensor.id)

    async def remove_sensor(self, sensor_id: str) -> None:
        async with self._lock:
            if sensor_id in self.sensors:
                del self.sensors[sensor_id]
                logger.info("Removed sensor %s", sensor_id)

    async def list_sensors(self) -> List[Sensor]:
        async with self._lock:
            return list(self.sensors.values())

    async def read_sensor(self, sensor_id: str) -> float:
        """Read a single sensor and return temperature in Celsius.

        Raises NotFoundError or SensorReadError on failure.
        """
        async with self._lock:
            sensor = self.sensors.get(sensor_id)

        if sensor is None:
            raise NotFoundError(f"Sensor not registered: {sensor_id}")

        path = f"{env.W1_DEVICES_BASE}/{sensor_id}/w1_slave"

        content = await read_text(path)
        try:
            crc_ok, temp_c = parse_w1_slave(content)
        except ParseError as exc:
            raise SensorReadError(f"Failed to parse sensor {sensor_id}: {exc}") from exc

        if not crc_ok:
            raise SensorReadError(f"CRC check failed for sensor {sensor_id}")

        return temp_c

    async def read_all_sensors(self) -> Dict[str, Optional[float]]:
        """Read all registered sensors concurrently.

        Returns a mapping of sensor_id -> temperature or None if failed.
        """
        async with self._lock:
            ids = list(self.sensors.keys())

        async def _read_one(sid: str) -> tuple[str, Optional[float]]:
            try:
                t = await self.read_sensor(sid)
                return sid, t
            except Exception as exc:  # don't let one failure stop others
                logger.warning("Failed reading sensor %s: %s", sid, exc)
                return sid, None

        tasks = [asyncio.create_task(_read_one(sid)) for sid in ids]
        results = await asyncio.gather(*tasks)
        return {sid: temp for sid, temp in results}

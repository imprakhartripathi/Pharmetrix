from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict

from config import env

logger = logging.getLogger(__name__)

try:
    import paho.mqtt.client as mqtt
except Exception as exc:  # pragma: no cover - runtime dependency
    mqtt = None  # type: ignore


class MQTTService:
    def __init__(self) -> None:
        if mqtt is None:
            raise RuntimeError("paho-mqtt is required. Install with 'pip install paho-mqtt'")

        self._client = mqtt.Client()
        if env.MQTT_USERNAME:
            self._client.username_pw_set(env.MQTT_USERNAME, env.MQTT_PASSWORD)

        self._connected = asyncio.Event()

    async def connect(self) -> None:
        loop = asyncio.get_running_loop()

        def _on_connect(client, userdata, flags, rc):
            if rc == 0:
                logger.info("Connected to MQTT broker %s:%s", env.MQTT_HOST, env.MQTT_PORT)
                try:
                    loop.call_soon_threadsafe(self._connected.set)
                except RuntimeError:
                    # loop closed
                    pass
            else:
                logger.warning("MQTT connect returned non-zero rc=%s", rc)

        self._client.on_connect = _on_connect

        # connect in a thread
        await asyncio.to_thread(self._client.connect, env.MQTT_HOST, env.MQTT_PORT)
        # start network loop in background thread
        self._client.loop_start()

        # wait briefly for connection
        try:
            await asyncio.wait_for(self._connected.wait(), timeout=5.0)
        except asyncio.TimeoutError:
            logger.warning("Timeout waiting for MQTT connect; continuing anyway")

    async def publish(self, topic: str, payload: Dict[str, Any]) -> None:
        data = json.dumps(payload)
        # publish is thread-safe but may block; use to_thread for safety
        await asyncio.to_thread(self._client.publish, topic, data)

    async def disconnect(self) -> None:
        try:
            await asyncio.to_thread(self._client.loop_stop)
            await asyncio.to_thread(self._client.disconnect)
        except Exception:
            pass

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# MQTT settings
MQTT_HOST: str = os.getenv("MQTT_HOST", "localhost")
MQTT_PORT: int = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME: str | None = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD: str | None = os.getenv("MQTT_PASSWORD")

# Poll interval in seconds
POLL_INTERVAL: float = float(os.getenv("POLL_INTERVAL", "10"))

# One-wire devices base path (Raspberry Pi sysfs)
W1_DEVICES_BASE: str = os.getenv("W1_DEVICES_BASE", "/sys/bus/w1/devices")

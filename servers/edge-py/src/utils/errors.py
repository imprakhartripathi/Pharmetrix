from __future__ import annotations


class SensorError(Exception):
    """Base class for sensor related errors."""


class NotFoundError(SensorError):
    """Raised when a sensor file or resource is not found."""


class ParseError(SensorError):
    """Raised when parsing of sensor data fails."""


class SensorReadError(SensorError):
    """Raised when reading a sensor fails for any reason."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Optional

from .errors import NotFoundError, SensorReadError


async def read_text(path: str) -> str:
    """Read a file from disk in a thread to avoid blocking the event loop.

    Raises NotFoundError if file does not exist.
    Raises SensorReadError for other IO errors.
    """
    p = Path(path)

    if not p.exists():
        raise NotFoundError(f"File not found: {path}")

    try:
        return await asyncio.to_thread(p.read_text)
    except Exception as exc:  # pragma: no cover - I/O safety
        raise SensorReadError(f"Failed to read {path}: {exc}") from exc

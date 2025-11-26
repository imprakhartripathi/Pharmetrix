from __future__ import annotations

import re
from typing import Tuple

from .errors import ParseError


CRC_RE = re.compile(r"crc=.* (YES|NO)$")
TEMP_RE = re.compile(r"t=(-?\d+)$")


def parse_w1_slave(content: str) -> Tuple[bool, float]:
    """Parse the contents of a DS18B20 `w1_slave` file.

    Returns (crc_ok, temperature_celsius)
    Raises ParseError on unexpected format.
    """
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    if len(lines) < 2:
        raise ParseError("Unexpected w1_slave content; less than 2 lines")

    # CRC check (line1 contains YES/NO at end)
    crc_ok = False
    m_crc = CRC_RE.search(lines[0])
    if m_crc:
        crc_ok = m_crc.group(1) == "YES"
    else:
        # fallback: look for 'YES' or 'NO'
        crc_ok = lines[0].endswith("YES")

    # Temperature (line2 contains t=xxxxx)
    m_temp = TEMP_RE.search(lines[1])
    if not m_temp:
        # sometimes temp is after space: find 't=' anywhere
        if "t=" in lines[1]:
            idx = lines[1].find("t=")
            raw = lines[1][idx + 2 :]
            try:
                temp_c = int(raw) / 1000.0
                return crc_ok, temp_c
            except Exception as exc:  # pragma: no cover - defensive
                raise ParseError(f"Invalid temperature value: {raw}") from exc

        raise ParseError("Temperature value not found in w1_slave output")

    temp_raw = int(m_temp.group(1))
    temp_c = temp_raw / 1000.0
    return crc_ok, temp_c

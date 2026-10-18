from dataclasses import dataclass
from datetime import datetime
from typing import Literal

HealthStatus = Literal["ok", "degraded"]


@dataclass(frozen=True, slots=True)
class HealthReport:
    """Refleja HealthResponse de @repo/contracts.

    Así todos los servicios responden /health con la misma forma.
    """

    status: HealthStatus
    service: str
    version: str
    uptime_seconds: int
    checked_at: datetime

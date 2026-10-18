from collections.abc import Callable
from datetime import datetime

from gravyx_ml.domain.health import HealthReport

SERVICE_NAME = "ml"
SERVICE_VERSION = "0.0.0"


def get_health(*, started_at: datetime, now: Callable[[], datetime]) -> HealthReport:
    """Arma el reporte de salud. `now` se inyecta para poder controlar el tiempo en pruebas."""
    current = now()
    return HealthReport(
        status="ok",
        service=SERVICE_NAME,
        version=SERVICE_VERSION,
        uptime_seconds=max(0, int((current - started_at).total_seconds())),
        checked_at=current,
    )

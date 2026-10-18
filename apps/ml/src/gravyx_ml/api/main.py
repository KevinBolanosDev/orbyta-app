from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

from gravyx_ml.application.get_health import get_health
from gravyx_ml.infrastructure.clock import utc_now

STARTED_AT = utc_now()

app = FastAPI(title="Gravyx Ascenda ML", version="0.0.0", docs_url=None, redoc_url=None)


class HealthResponse(BaseModel):
    """Misma forma JSON que HealthResponse de @repo/contracts (camelCase en la respuesta)."""

    model_config = ConfigDict(populate_by_name=True)

    status: Literal["ok", "degraded"]
    service: str
    version: str
    uptime_seconds: int = Field(alias="uptimeSeconds")
    checked_at: str = Field(alias="checkedAt")


@app.get("/health", response_model=HealthResponse, response_model_by_alias=True)
def health() -> HealthResponse:
    report = get_health(started_at=STARTED_AT, now=utc_now)
    return HealthResponse(
        status=report.status,
        service=report.service,
        version=report.version,
        uptime_seconds=report.uptime_seconds,
        checked_at=report.checked_at.isoformat().replace("+00:00", "Z"),
    )

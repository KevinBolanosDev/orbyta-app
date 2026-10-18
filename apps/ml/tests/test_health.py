from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from gravyx_ml.api.main import app
from gravyx_ml.application.get_health import get_health


def test_get_health_computes_uptime() -> None:
    started = datetime(2026, 10, 17, 12, 0, tzinfo=UTC)
    report = get_health(started_at=started, now=lambda: started + timedelta(seconds=42))
    assert report.uptime_seconds == 42
    assert report.status == "ok"


def test_health_endpoint_matches_contract_shape() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"status", "service", "version", "uptimeSeconds", "checkedAt"}
    assert body["service"] == "ml"
    assert body["checkedAt"].endswith("Z")

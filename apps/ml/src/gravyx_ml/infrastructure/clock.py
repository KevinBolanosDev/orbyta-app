from datetime import UTC, datetime


def utc_now() -> datetime:
    """Hora actual en UTC (reloj real del sistema)."""
    return datetime.now(UTC)

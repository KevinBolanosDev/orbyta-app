# apps/ml

Servicio interno de ML de Gravyx Ascenda (FastAPI + uv). Solo el API lo llama. Ver `docs/plan-desarrollo.md` §4.3 y §9.

- `pnpm --filter @repo/ml dev` → http://localhost:8000/health
- Capas: `domain/` → `application/` → `infrastructure/`, expuestas por `api/`.

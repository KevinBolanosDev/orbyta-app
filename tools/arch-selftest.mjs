// Prueba que los linters de arquitectura siguen bloqueando imports prohibidos (criterio de salida §12).
// Por cada caso escribe un archivo temporal con una violación, corre el linter, espera que FALLE
// con la regla indicada y siempre borra el archivo. Se corre con `pnpm arch:selftest` (también en CI).
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const cases = [
  {
    name: 'client: an entity imports a feature (upward import)',
    cwd: 'apps/client',
    probeDir: 'src/entities/arch-probe',
    file: 'src/entities/arch-probe/index.ts',
    content: "export { PreviewBuyForm } from '@/features/preview-buy';\n",
    command: 'pnpm exec eslint src/entities/arch-probe/index.ts',
    expect: 'boundaries/dependencies',
  },
  {
    name: 'client: a feature bypasses the public API of an entity',
    cwd: 'apps/client',
    probeDir: 'src/features/arch-probe',
    file: 'src/features/arch-probe/index.ts',
    content: "export { getHealth } from '@/entities/system-status/api/get-health';\n",
    command: 'pnpm exec eslint src/features/arch-probe/index.ts',
    expect: 'boundaries/dependencies',
  },
  {
    name: 'client: a widget imports another widget (same layer)',
    cwd: 'apps/client',
    probeDir: 'src/widgets/arch-probe',
    file: 'src/widgets/arch-probe/index.ts',
    content: "export { ApiStatusCard } from '@/widgets/api-status';\n",
    command: 'pnpm exec eslint src/widgets/arch-probe/index.ts',
    expect: 'boundaries/dependencies',
  },
  {
    name: 'api: domain imports NestJS',
    cwd: 'apps/api',
    probeDir: 'src/modules/arch-probe',
    file: 'src/modules/arch-probe/domain/probe.ts',
    content: "import { Injectable } from '@nestjs/common';\n\nexport const probe = Injectable;\n",
    command: 'pnpm exec depcruise src --config .dependency-cruiser.cjs',
    expect: 'domain-is-pure',
  },
  {
    name: 'api: a module imports internals of another module',
    cwd: 'apps/api',
    probeDir: 'src/modules/arch-probe',
    file: 'src/modules/arch-probe/application/probe.ts',
    content: "export { Position } from '../../wiring/domain/position.js';\n",
    command: 'pnpm exec depcruise src --config .dependency-cruiser.cjs',
    expect: 'modules-only-through-public-api',
  },
  {
    name: 'ml: the domain layer imports FastAPI',
    cwd: 'apps/ml',
    probeDir: 'src/gravyx_ml/domain/arch_probe',
    file: 'src/gravyx_ml/domain/arch_probe/__init__.py',
    content: 'from fastapi import FastAPI\n\n__all__ = ["FastAPI"]\n',
    command: 'uv run --frozen ruff check src/gravyx_ml/domain/arch_probe',
    expect: 'TID251',
  },
];

let failures = 0;

for (const testCase of cases) {
  const cwd = join(root, testCase.cwd);
  const probeDir = join(cwd, testCase.probeDir);
  const file = join(cwd, testCase.file);
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, testCase.content);
    const result = spawnSync(testCase.command, { cwd, shell: true, encoding: 'utf8' });
    const output = `${result.stdout}${result.stderr}`;
    const blocked = result.status !== 0 && output.includes(testCase.expect);
    console.log(`${blocked ? 'PASS' : 'FAIL'}  ${testCase.name}  (expects ${testCase.expect})`);
    if (!blocked) {
      failures += 1;
      console.log(output);
    }
  } finally {
    rmSync(probeDir, { recursive: true, force: true });
  }
}

if (failures > 0) {
  console.error(`\n${failures} architecture rule(s) did not block a forbidden import.`);
  process.exit(1);
}
console.log('\nAll architecture rules block forbidden imports.');

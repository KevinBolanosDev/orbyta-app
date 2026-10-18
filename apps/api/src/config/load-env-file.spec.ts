import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { loadEnvFile } from './env.js';

describe('loadEnvFile', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gravyx-env-'));

  afterEach(() => {
    Reflect.deleteProperty(process.env, 'GRAVYX_TEST_VALUE');
  });

  it('loads variables when the file exists', () => {
    const file = join(dir, '.env');
    writeFileSync(file, 'GRAVYX_TEST_VALUE=loaded\n');
    loadEnvFile(file);
    expect(process.env['GRAVYX_TEST_VALUE']).toBe('loaded');
    rmSync(file);
  });

  it('does nothing when the file is missing', () => {
    expect(() => {
      loadEnvFile(join(dir, 'missing.env'));
    }).not.toThrow();
    expect(process.env['GRAVYX_TEST_VALUE']).toBeUndefined();
  });
});

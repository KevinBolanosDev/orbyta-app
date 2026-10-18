import { defineConfig } from 'vitest/config';

import { vitestDefaults } from '@repo/config/vitest';

// Plan §16: @repo/finance mantiene una cobertura de 95 % o más.
export default defineConfig(vitestDefaults({ coverageThreshold: 95 }));

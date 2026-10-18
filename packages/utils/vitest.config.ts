import { defineConfig } from 'vitest/config';

import { vitestDefaults } from '@repo/config/vitest';

export default defineConfig(vitestDefaults({ coverageThreshold: 90 }));

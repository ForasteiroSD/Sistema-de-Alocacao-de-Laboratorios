import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        reporters: ['default'],
        coverage: {
            provider: 'v8',
            include: ['src'],
            exclude: ['server.ts', 'prisma.config.ts']
        },
        projects: [
        {
            extends: true,
            test: {
                name: 'integration',
                include: ['tests/integration/**/*.test.ts'],
                setupFiles: ['./tests/integration/vitest.setup.ts'],
                globalSetup: './tests/integration/globalSetup.ts',
                fileParallelism: false,
                exclude: ['src/**/*.test.ts', 'src/types'], 
            }
        },
        {
            extends: true,
            test: {
                name: 'unit',
                include: ['tests/unit/**/*.test.ts'],
            }
        }
    ]},
});
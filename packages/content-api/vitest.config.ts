import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      GO_API_JWT_SECRET: 'vitest-go-api-jwt-secret-32-characters',
      GO_API_JWT_ISSUER: 'https://issuer.vitest',
      GO_API_JWT_AUDIENCE: 'https://aud.vitest',
    },
  },
})

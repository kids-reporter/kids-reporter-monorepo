import baseConfig, { nodeConfig } from '../../eslint.base.config.mjs'

export default [
  ...baseConfig,
  {
    ...nodeConfig,
    files: ['src/**/*.{ts,js}'],
    rules: {
      ...nodeConfig.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]

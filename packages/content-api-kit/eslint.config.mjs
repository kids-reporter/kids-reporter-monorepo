import baseConfig, {
  nodeConfig,
  typescriptConfig,
} from '../../eslint.base.config.mjs'

export default [
  ...baseConfig,
  {
    ...typescriptConfig,
    files: ['src/**/*.ts', 'src/**/*.d.ts'],
    rules: {
      ...typescriptConfig.rules,
    },
  },
  {
    ...nodeConfig,
    files: ['**/*.config.{js,mjs,cjs}', 'scripts/**/*.sh'],
  },
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]

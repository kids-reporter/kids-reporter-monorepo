import baseConfig, {
  nodeConfig,
  typescriptConfig,
} from '../../eslint.base.config.mjs'

export default [
  ...baseConfig,
  {
    ...typescriptConfig,
    files: ['src/**/*.ts'],
    rules: {
      ...typescriptConfig.rules,
    },
  },
  {
    ...nodeConfig,
    files: ['**/*.config.{js,mjs,cjs}'],
  },
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]

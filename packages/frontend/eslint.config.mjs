import baseConfig, {
  javascriptConfig,
  nodeConfig,
  typescriptConfig,
} from '../../eslint.base.config.mjs'

const config = [
  ...baseConfig,
  // Override for frontend package - React/Next.js focused
  {
    ...typescriptConfig,
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      ...typescriptConfig.rules,
      // Next.js specific rules
      'no-html-link-for-pages': 'off',
      // Disable rules that conflict with Next.js patterns
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
    },
  },
  {
    ...javascriptConfig,
    files: ['src/**/*.{js,jsx}'],
    rules: {
      ...javascriptConfig.rules,
      // Next.js specific rules
      'no-html-link-for-pages': 'off',
      // Disable rules that conflict with Next.js patterns
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
    },
  },
  // Node.js configuration for config files
  {
    ...nodeConfig,
    files: ['**/*.config.{js,mjs}', '**/environment-variables.ts'],
    rules: {
      ...nodeConfig.rules,
      'no-undef': 'error',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', 'out/**'],
  },
]

export default config

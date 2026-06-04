import globals from 'globals'

import baseConfig from './eslint.base.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['packages/**/*.{js,ts}', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.node,
        process: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      '*.min.js',
      'packages/*/dist/**',
      'packages/*/build/**',
      'packages/*/.next/**',
      'packages/*/lib/**',
      'packages/*/lib-temp/**',
      '**/migrations/**',
      '**/public/**',
      '**/.keystone/**',
      '**/.git/**',
      '**/.env.local*',
    ],
  },
]

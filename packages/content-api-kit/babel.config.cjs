module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '18',
          browsers: ['> 1%', 'last 2 versions', 'not dead'],
        },
        modules: false, // Output ESM for "type": "module"
      },
    ],
    [
      '@babel/preset-typescript',
      {
        allExtensions: true,
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
}

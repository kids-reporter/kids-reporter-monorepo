/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  poweredByHeader: false,
}
module.exports = nextConfig

/*
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})
*/

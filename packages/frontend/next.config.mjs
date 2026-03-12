/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath:
    process.env.NEXT_PUBLIC_IS_PREVIEW_MODE === 'true' ? '/preview-server' : '',
  deploymentId: process.env.DEPLOYMENT_ID || undefined,
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  poweredByHeader: false, // Remove poweredby for security issue, ref: https://nextjs.org/docs/pages/api-reference/next-config-js/poweredByHeader
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kids-storage.twreporter.org',
      },
      {
        protocol: 'https',
        hostname: '*-kids-storage.twreporter.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}
export default nextConfig

/*
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
export default withBundleAnalyzer({})
*/

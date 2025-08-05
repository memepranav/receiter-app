/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external access
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Configure for production deployment
  output: 'standalone',
  // Disable x-powered-by header
  poweredByHeader: false,
  // Configure asset prefix based on environment
  assetPrefix: process.env.NODE_ENV === 'production' && process.env.ASSET_PREFIX 
    ? process.env.ASSET_PREFIX 
    : '',
  // Configure base path if needed
  basePath: process.env.BASE_PATH || '',
}

module.exports = nextConfig
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
}

module.exports = nextConfig
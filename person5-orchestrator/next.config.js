/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Person 5 Orchestrator',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig

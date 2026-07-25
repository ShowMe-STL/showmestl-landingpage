import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.191', '192.168.1.191:3000'],
  output: 'standalone',
}

export default nextConfig

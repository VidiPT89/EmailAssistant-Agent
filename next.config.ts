import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: ['googleapis'],
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig

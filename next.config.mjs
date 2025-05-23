/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude SQLite from the serverless bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sqlite3')
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add any other configurations you need
}

export default nextConfig

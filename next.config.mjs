/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable trailing slashes in URLs
  trailingSlash: false,
  
  // Keep existing configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization configuration
  images: {
    domains: ['localhost', 'installmod.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig

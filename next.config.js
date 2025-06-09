/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  optimizeFonts: false,
  poweredByHeader: false,
  experimental: {
    disableOptimizedLoading: true,
    disableStaticImages: false,
  },
}

module.exports = nextConfig

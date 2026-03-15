/** @type {import('next').NextConfig} */
const nextConfig = {
  // v2.5.3 - 进一步禁用开发指示器以彻底解决 SegmentViewNode 相关的 Manifest 错误
  output: 'standalone',
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

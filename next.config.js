/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  webpack: (config) => {
    config.externals = [...(config.externals || []), "pino-pretty", "encoding"];
    return config;
  },
};

module.exports = nextConfig;

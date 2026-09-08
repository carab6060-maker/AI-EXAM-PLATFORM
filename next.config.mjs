/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/**/*', './dev.db', './prisma/dev.db'],
    '/**/*': ['./prisma/**/*', './dev.db', './prisma/dev.db'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

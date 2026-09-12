/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled in dev: React Strict Mode double-invokes effects causing duplicate
  // API calls (2x fetches per mount) which is the primary source of slowness
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Tree-shake large icon/chart libs at compile time for faster cold starts
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;

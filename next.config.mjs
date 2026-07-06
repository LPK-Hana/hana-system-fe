/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? '1',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SKIP_AUTH_IN_DEV: process.env.SKIP_AUTH_IN_DEV,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

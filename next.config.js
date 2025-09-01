/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SKIP_AUTH_IN_DEV: process.env.SKIP_AUTH_IN_DEV,
  },
};

module.exports = nextConfig;

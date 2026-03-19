/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //output: process.env.BUILD_TARGET === 'docker' ? 'standalone' : undefined,
}

module.exports = nextConfig;
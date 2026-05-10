/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '/freefire-strat-planner',
  assetPrefix: '/freefire-strat-planner/',
};

export default nextConfig;
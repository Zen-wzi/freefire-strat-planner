/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/freefire-strat-planner',
  assetPrefix: '/freefire-strat-planner/',
  trailingSlash: true,
}

export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/freefire-start-planner',
  assetPrefix: '/freefire-start-planner/',
}

export default nextConfig
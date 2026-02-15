/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'console.aichixia.xyz',
          },
        ],
        destination: '/console',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'console.aichixia.xyz',
          },
        ],
        destination: '/console/:path*',
      },
    ]
  },
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/console/:path*',
        has: [
          {
            type: 'host',
            value: 'console.aichixia.xyz',
          },
        ],
      },
    ];
  },
}

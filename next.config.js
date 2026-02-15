/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async rewrites() {
    return {
      beforeFiles: [
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
      ],
    };
  },

  async redirects() {
    return [
      {
        source: '/pages/console/:path*',
        destination: '/404',
        permanent: false,
        has: [
          {
            type: 'host',
            value: 'aichixia.xyz',
          },
        ],
      },
      {
        source: '/console/:path*',
        destination: '/404',
        permanent: false,
        has: [
          {
            type: 'host',
            value: 'aichixia.xyz',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

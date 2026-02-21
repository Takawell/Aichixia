/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'api.aichixia.xyz' }],
          destination: '/api/:path*',
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

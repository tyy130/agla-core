const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    const { isServer } = options;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'shell',
        remotes: {
          cortex: `cortex@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
        },
        filename: 'static/chunks/remoteEntry.js',
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
            eager: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
            eager: false,
          },
        },
      })
    );

    return config;
  },
};

module.exports = nextConfig;
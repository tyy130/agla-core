const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    const { isServer } = options;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'cortex',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './Chat': './src/components/ChatInterface.tsx',
        },
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
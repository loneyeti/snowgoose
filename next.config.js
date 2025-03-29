/** @type {import('next').NextConfig} */

module.exports = {
  output: "standalone",
  webpack: (config, _) => ({
    ...config,
    watchOptions: {
      ...config.watchOptions,
      poll: 800,
      aggregateTimeout: 300,
    },
  }),
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

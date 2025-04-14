/** @type {import('next').NextConfig} */

const { withAxiom } = require("next-axiom");

module.exports = withAxiom({
  output: "standalone",
  // Add the local package to transpilePackages
  transpilePackages: ["@snowgoose/ai-vendors"],
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
});
/*
const nextConfig = {
  output: "standalone",
  // Add the local package to transpilePackages
  transpilePackages: ["@snowgoose/ai-vendors"],
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

export default withAxiom(nextConfig);
*/

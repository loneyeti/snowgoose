/** @type {import('next').NextConfig} */

const { withAxiom } = require("next-axiom");
const { resolve } = require("path");

module.exports = withAxiom({
  output: "standalone",
  // Add the local package to transpilePackages
  // transpilePackages: ["snowgander"],
  webpack: (config, _) => (
    (config.resolve.symlinks = false),
    {
      ...config,
      watchOptions: {
        ...config.watchOptions,
        poll: 800,
        aggregateTimeout: 300,
      },
    }
  ),
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // externalDir: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            // This is the modern replacement for X-Frame-Options.
            // 'self' means only your own domain can frame the content.
            value: "frame-ancestors 'self';",
          },
        ],
      },
    ];
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["formiojs", "@formio/react", "@formio/choices.js"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

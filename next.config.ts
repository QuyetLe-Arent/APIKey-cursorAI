import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating "N" dev tools button (overlaps sidebar Sign out in dev).
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

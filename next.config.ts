import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'img.youtube.com',
      process.env.AWS_CLOUDFRONT_HOSTNAME!
    ],
  },
};

export default nextConfig;

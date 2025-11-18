import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Or any desired size, e.g., '10mb'
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "yowafgrayhrihobmztpa.supabase.co",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;

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
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Asegurar que Prisma funcione en producción
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  /* config options here */
};

export default nextConfig;

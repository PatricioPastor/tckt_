import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  session:{
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  trustedOrigins: ["*"], // Permite cualquier origen
});

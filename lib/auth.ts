import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";



export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders:{
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session:{
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  trustedOrigins: ["*"], 
});

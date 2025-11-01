import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail, getPasswordResetEmailTemplate } from "./email";



export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      const { html, text } = getPasswordResetEmailTemplate(url, user.name);

      await sendEmail({
        to: user.email,
        subject: "Restablecer tu contraseña en tckt_",
        html,
        text,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hora en segundos
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

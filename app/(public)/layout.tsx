import { PublicLayoutClient } from "./layout-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtener sesión en el servidor
  const headersList = await headers();
  const sessionData = await auth.api.getSession({
    headers: headersList,
  });

  let user = null;

  // If session exists, fetch complete user data including imageBase64 to prevent hydration mismatch
  if (sessionData?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionData.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        
        image: true,
        createdAt: true,
        updatedAt: true,
        username: true,
        role: true,
        dni: true,
        birthDate: true,
      },
    });

    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified,
        image: dbUser.image,
        
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
        username: dbUser.username,
        role: dbUser.role,
        dni: dbUser.dni,
        birthDate: dbUser.birthDate,
      };
    }
  }

  // Pasar datos al Client Component
  return <PublicLayoutClient user={user as any}>{children}</PublicLayoutClient>;
}
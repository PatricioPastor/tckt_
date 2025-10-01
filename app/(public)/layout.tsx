import { PublicLayoutClient } from "./layout-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

  const user = sessionData?.user ?? null;

  // Pasar datos al Client Component
  return <PublicLayoutClient user={user}>{children}</PublicLayoutClient>;
}
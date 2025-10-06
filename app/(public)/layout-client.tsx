"use client";

import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/user-sidebar";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PublicLayoutClientProps {
  children: ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    imageBase64?: string | null;
  } | null;
}

export function PublicLayoutClient({ children, user }: PublicLayoutClientProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // HomePage tiene su propio layout especial (fullscreen)
  if (isHomePage) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {user && <AppSidebar user={user as any} variant="floating" side="right" />}
        <div className="min-h-screen bg-black w-full">
          {children}
        </div>
      </SidebarProvider>
    );
  }

  // Páginas regulares con header y sidebar
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {user && <AppSidebar user={user as any} variant="floating" side="right" />}

      <SidebarInset>
        <div
          className="
            relative flex flex-1 flex-col md:static
            min-h-[100svh]
            max-h-[100dvh]
            overflow-x-hidden overflow-y-auto
            supports-[height:100dvh]:min-h-[100dvh]
          "
        >
          <SiteHeader user={user as any} />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

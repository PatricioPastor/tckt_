"use client";

import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/user-sidebar";
import { useUserStore } from "@/lib/store/user-store";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { is } from "date-fns/locale";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUserStore();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  if (isPending ){
    return "docargan...."
  }  


  if ( !session ) {
    return router.push('/login');
  }

  
  
  const currentUser =  {...session!.user, ...user!};
  
  
  const isHomePage = pathname === '/';

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
        <AppSidebar user={currentUser} variant="floating" side="right" />
        <div className="min-h-screen bg-black w-full">
          {children}
        </div>
      </SidebarProvider>
    );
  }

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={currentUser} variant="floating" side="right" />

        <SidebarInset>
          <div
            className="
              relative flex flex-1 flex-col md:static
              min-h-[100svh]      
              max-h-[100dvh]          /* svh = viewport real en mobile */
              overflow-x-hidden overflow-y-auto
              supports-[height:100dvh]:min-h-[100dvh]  /* fallback moderno */
            "
          >
            <SiteHeader user={currentUser} />
            {children}
          </div>
        </SidebarInset>

      </SidebarProvider>
    </>
  );
}
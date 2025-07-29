

import { AppSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";


export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();

  const sessionData = await auth.api.getSession({
    headers: headersList, // you need to pass the headers object.
  });

  const user = sessionData?.user ?? null;


  if (!user) {
    console.log("No user");
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
            {user && (
        <AppSidebar
          user={{
            ...user,
            image: user.image ?? null, // Normalizamos a null si es undefined
          }}
          
          variant="floating" 
          side="right"
        />
      )}
      <SidebarInset>
                <SiteHeader />
        <div className="relative flex flex-1 flex-col md:static">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </>
  );
}

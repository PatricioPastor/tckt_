"use client"


import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/user-sidebar";
import { useUserStore } from "@/lib/store/user-store";


export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const {user} = useUserStore();

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
            
        <AppSidebar
          user={user}
          variant="floating" 
          side="right"
          
        />
      
      <SidebarInset>
        <div className=" relative max-h-screen flex flex-1 flex-col md:static">
        <SiteHeader user={user} />
          
              
              {children}
            
          
        </div>
      </SidebarInset>
    </SidebarProvider>
    </>
  );
}

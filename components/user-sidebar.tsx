"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { Calendar, Home01, Ticket01, User01 } from "@untitledui/icons";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { User } from "@/lib/store/user-store";
import Image from "next/image";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: User | null;
};

const data = {
  navMain: [
    {
      title: "Mis Tickets",
      url: "/tickets",
      icon: Ticket01,
    },
    {
      title: "Eventos",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Mi Cuenta",
      url: "/account",
      icon: User01,
    },
  ],
  navSecondary: [
    {
      title: "Inicio",
      url: "/",
      icon: Home01,
    },
  ],
};

function LogoMono() {
  return <Image src="/isotipo.svg" alt="tckt_" width={120} height={50} />;
}

export function AppSidebar({ user: propUser, ...props }: AppSidebarProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Use session.user if propUser is not provided
  const resolvedUser = propUser || session?.user;

  useEffect(() => {
    if (!isPending && !resolvedUser) {
      router.push("/login");
    }
  }, [isPending, resolvedUser, router]);

  const handleLogin = () => router.push("/login");

  if (isPending) {
    return <></>
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-[#0B0B0B] text-neutral-200 border-r border-neutral-800"
      {...props}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-neutral-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2 hover:bg-[#111] rounded-md"
            >
              <Link href="/" aria-label="Inicio">
                <LogoMono />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="gap-3">
        {resolvedUser ? (
          <NavMain items={data.navMain} />
        ) : (
          <div className="px-3 pt-3">
            <div className="rounded-lg border border-neutral-800 bg-[#0E0E0E] p-4">
              <p className="mb-3 text-sm text-neutral-400">
                Iniciá sesión para ver tus tickets y eventos.
              </p>
              <button
                onClick={handleLogin}
                className="w-full h-10 rounded-md bg-neutral-100 text-sm font-medium text-black hover:bg-neutral-200 transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )}

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-neutral-800">
        {resolvedUser ? <NavUser user={resolvedUser as any} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
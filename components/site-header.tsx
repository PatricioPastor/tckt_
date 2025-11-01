"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket01 } from "@untitledui/icons";
import { IconChevronDown, IconLogout, IconTicket, IconUser } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoutButton from "@/components/auth/logout-button";

type FlexibleUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  [key: string]: any;
};

interface SiteHeaderProps {
  user: FlexibleUser | null;
}

function LogoMono() {
  return <Image src="/isotipo.svg" alt="tckt_" width={84} height={40} priority />;
}

function HeaderUserMenu({ user }: { user: FlexibleUser }) {
  const router = useRouter();

  const { displayName, displayEmail, initials, avatarSrc } = useMemo(() => {
    const safeName = user?.name?.trim() || "";
    const safeEmail = user?.email?.trim() || "";
    const fallback = safeName?.[0] || safeEmail?.[0] || "U";

    return {
      displayName: safeName || safeEmail || "Mi cuenta",
      displayEmail: safeEmail,
      initials: fallback.toUpperCase(),
      avatarSrc: user?.image || "",
    };
  }, [user]);

  const goToProfile = () => router.push("/profile");
  const goToTickets = () => router.push("/tickets");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/0 px-2 py-1 text-sm font-medium text-neutral-100 hover:border-white/15 hover:bg-white/5"
        >
          <Avatar className="h-8 w-8 rounded-md">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="rounded-md text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate sm:inline-flex">{displayName}</span>
          <IconChevronDown className="hidden h-3 w-3 text-neutral-400 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-xl border border-neutral-800 bg-[#0f0f10] text-neutral-100 shadow-lg"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Tu cuenta
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={goToProfile} className="gap-2 text-sm focus:bg-white/10">
            <IconUser size={16} />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={goToTickets} className="gap-2 text-sm focus:bg-white/10">
            <IconTicket size={16} />
            Mis tickets
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem className="gap-2 text-sm focus:bg-white/10">
          <IconLogout size={16} />
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const router = useRouter();

  const goToLogin = () => router.push("/login");
  const goToSignup = () => router.push("/signup");
  const goToEvents = () => router.push("/");
  const goToHome = () => router.push("/home");

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-900/70 bg-black/70 backdrop-blur-lg">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Link href="/" aria-label="Inicio" className="flex items-center gap-2">
          <LogoMono />
        </Link>

        <Separator orientation="vertical" className="hidden h-5 bg-neutral-800 sm:block" />

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToHome}
                className="hidden rounded-lg border border-white/5 bg-white/0 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-white/5 sm:inline-flex"
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToEvents}
                className="hidden rounded-lg border border-white/5 bg-white/0 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-white/5 md:inline-flex"
              >
                Explorar eventos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToHome}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/0 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-white/5 sm:hidden"
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/tickets")}
                className="hidden items-center gap-2 rounded-lg border border-white/5 bg-white/0 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-white/5 sm:flex"
              >
                <Ticket01 size={16} />
                Tickets
              </Button>
              <HeaderUserMenu user={user} />
              <SidebarTrigger
                user={user}
                className="hidden rounded-lg border border-white/10 p-2 text-neutral-300 transition-colors hover:border-white/30 hover:text-white lg:inline-flex"
              />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToEvents}
                className="hidden rounded-lg border border-white/5 bg-white/0 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-white/5 sm:inline-flex"
              >
                Explorar eventos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToLogin}
                className="rounded-lg border border-white/5 bg-white/0 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-white/5"
              >
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                onClick={goToSignup}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black hover:bg-white/90"
              >
                Crear cuenta
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

"use client"


import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@/lib/store/user-store";
import { Ticket01 } from "@untitledui/icons";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";


interface SiteHeaderProps {
  user: User | null;
}

function LogoMono() {
  return <Image src="/isotipo.svg" alt="tckt_" width={80} height={40} />;
}

export function SiteHeader({user}: SiteHeaderProps) {
  const router = useRouter();
  const showTickets = () => {
    if (!user) {
      router.push("/login?tab=signup");
      return;
    }
    router.push("/tickets");
  };

  const handleSidebarClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      e.stopPropagation(); // Prevenir que toggleSidebar se ejecute
      router.push("/login?tab=signup");
    }
    // Si hay user, el SidebarTrigger ejecutará toggleSidebar automáticamente
  };

  return (
    <header className="flex sticky top-0 z-50 shrink-0 items-center gap-2 border-b border-neutral-800 bg-black/80 backdrop-blur-sm transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-4 px-4 py-3">
        <Link href="/">
          <LogoMono />
        </Link>
        <Separator
          orientation="vertical"
          className="mx-3 data-[orientation=vertical]:h-5 bg-neutral-700"
        />
        <div className="flex items-center justify-end flex-grow gap-3">
          <button
            onClick={showTickets}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Ticket01 size={20} />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger
            user={user}
            className="text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={handleSidebarClick}
          />
        </div>
      </div>
    </header>
  );
}

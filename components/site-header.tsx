"use client"


import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "@/lib/store/user-store";
import { Ticket01 } from "@untitledui/icons";
import { useRouter } from "next/navigation";


interface SiteHeaderProps {
  user: User | null;
}


export function SiteHeader({user}: SiteHeaderProps) {
  const router = useRouter();
  const showTickets = () => {
    router.push("/tickets");
  };

  return (
    <header className="flex sticky top-0 z-50 shrink-0 items-center gap-2 border-b border-neutral-800 bg-black/80 backdrop-blur-sm transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-4 px-4 py-3">
        <a href="/">
          <h1  className="text-lg font-medium text-white">tckt_</h1>
        </a>
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
          <SidebarTrigger user={user} className="text-neutral-400 hover:text-white hover:bg-neutral-800" />
        </div>
      </div>
    </header>
  );
}

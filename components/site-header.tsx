import { Button } from "@/components/ui/button";
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
    <header className="flex sticky z-10 top-0 right-0 h-(--header-height) shrink-0 items-center gap-2 border-b bg-gray-500/5 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-6 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-mono font-medium">tckt_</h1>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center justify-end flex-grow gap-2">
          <Ticket01 size={24} onClick={showTickets}/>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SidebarTrigger user={user} className="-ml-1" />
        </div>
      </div>
    </header>
  );
}

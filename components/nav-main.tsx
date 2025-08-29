"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Item = { title: string; url: string; icon?: React.ElementType; badge?: string };

export function NavMain({ items }: { items: Item[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.url || pathname.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} className="group">
                  <SidebarMenuButton
                    tooltip={item.title}
                    data-state={active ? "active" : "inactive"}
                    aria-current={active ? "page" : undefined}
                    className={`
                      rounded-md border border-transparent
                      text-neutral-200
                      h-10 px-3
                      hover:bg-[#111] hover:border-neutral-800
                      data-[state=active]:bg-[#121212] data-[state=active]:border-neutral-700
                    `}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span className="truncate">{item.title}</span>

                    {/* Badge opcional */}
                    {item.badge ? (
                      <span
                        className="
                          ml-auto rounded-full border border-neutral-700 bg-[#151515]
                          px-2 py-0.5 text-[11px] leading-none text-neutral-300
                        "
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

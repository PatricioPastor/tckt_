"use client";

import { ReactNode } from 'react';
import { IconCalendarSearch, IconQrcode, IconShare, IconUser } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

type QuickAction = {
  id: string;
  label: string;
  description: string;
  onClick: () => void;
};

type HomeQuickActionsProps = {
  actions: QuickAction[];
};

const iconMap: Record<string, ReactNode> = {
  explore: <IconCalendarSearch size={18} />,
  tickets: <IconQrcode size={18} />,
  friends: <IconShare size={18} />,
  profile: <IconUser size={18} />,
};

export default function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  return (
    <aside className="rounded-xl border border-white/5 bg-[#0f0f0f] p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">Acciones rápidas</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            onClick={action.onClick}
            className="flex h-auto flex-col items-start gap-1 rounded-lg border border-white/5 bg-[#131313] px-3 py-3 text-left text-sm font-medium text-neutral-200 hover:border-white/15 hover:bg-[#181818]"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              {iconMap[action.id] ?? iconMap.profile}
              {action.label}
            </span>
            <span className="text-xs text-neutral-400">{action.description}</span>
          </Button>
        ))}
      </div>
    </aside>
  );
}

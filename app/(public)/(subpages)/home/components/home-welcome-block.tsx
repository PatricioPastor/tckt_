"use client";

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type HomeWelcomeBlockProps = {
  userName: string;
  hasUpcoming: boolean;
  upcomingName: string;
  upcomingDate: Date | null;
};

const formatDate = (date: Date | null) => {
  if (!date) return '';
  return format(date, "EEEE d 'de' MMMM", { locale: es });
};

export default function HomeWelcomeBlock({
  userName,
  hasUpcoming,
  upcomingName,
  upcomingDate,
}: HomeWelcomeBlockProps) {
  return (
    <section className="rounded-xl border border-white/5 bg-[#111111] px-5 py-6 text-neutral-100 sm:px-8 sm:py-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Bienvenido</p>
          <h1 className="text-2xl font-semibold sm:text-3xl text-white">
            Hola {userName.split(' ')[0] ?? userName}, sigamos con tu agenda.
          </h1>
          <p className="text-sm text-neutral-400 sm:max-w-xl">
            Todo lo que necesitas para llegar al show correcto, con la gente correcta y los accesos listos.
          </p>
        </div>
        {hasUpcoming ? (
          <div className="rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-neutral-200">
            <p className="font-medium text-white">{upcomingName}</p>
            <p className="text-xs uppercase tracking-wide text-neutral-500">{formatDate(upcomingDate)}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

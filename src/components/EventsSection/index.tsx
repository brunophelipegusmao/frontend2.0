import Image from "next/image";

import { InteractiveCalendar } from "../InteractiveCalendar";
import type { EventHighlight } from "@/types/event";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function EventsSection({ events }: { events: EventHighlight[] }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingEvent = events
    .slice()
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    .find((event) => new Date(event.date).getTime() >= todayStart.getTime()) ??
    events[events.length - 1];

  if (!upcomingEvent) {
    return null;
  }

  const eventDate = new Date(upcomingEvent.date);

  return (
    <section id="events" className="space-y-8">
        <div className="mx-auto max-w-6xl space-y-3 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.6rem] text-[var(--gold-tone-dark)]">
          Eventos e experiências
        </p>
        <h2 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
          Agenda viva do JM Fitness
        </h2>
        <p className="max-w-2xl text-base text-[var(--muted-foreground)]">
          Selecionamos o próximo encontro para você garantir presença com antecedência.
        </p>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
          <article className="flex h-full flex-col justify-between gap-4 rounded-[28px] border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_10px_30px_var(--shadow)]">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={upcomingEvent.image}
                alt={upcomingEvent.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4rem] text-[var(--gold-tone)]">
                {dateFormatter.format(eventDate)} • {upcomingEvent.time}
              </p>
              <h3 className="text-2xl font-semibold text-[var(--foreground)]">
                {upcomingEvent.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {upcomingEvent.description}
              </p>
            </div>
            <p className="text-xs font-semibold tracking-[0.4rem] text-[#f5d98c]">
              {upcomingEvent.location}
            </p>
          </article>

          <div className="h-full">
            <InteractiveCalendar events={events} />
          </div>
        </div>
      </div>
    </section>
  );
}

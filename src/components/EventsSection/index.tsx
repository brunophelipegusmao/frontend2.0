import Image from "next/image";

import { InteractiveCalendar } from "../InteractiveCalendar";
import type { EventHighlight } from "@/types/event";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const parseDate = (value: string) => {
  const directMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (directMatch) {
    const year = Number(directMatch[1]);
    const month = Number(directMatch[2]);
    const day = Number(directMatch[3]);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const isCancelledEvent = (event: EventHighlight) => event.status === "cancelled";

export function EventsSection({ events }: { events: EventHighlight[] }) {
  const upcomingEvent =
    events.find((event) => event.isFeatured && !isCancelledEvent(event)) ??
    events.find((event) => !isCancelledEvent(event)) ??
    events[0] ??
    null;

  if (!upcomingEvent) {
    return null;
  }

  const eventDate = parseDate(upcomingEvent.date);

  return (
    <section id="events" className="space-y-8">
      <div className="mx-auto max-w-6xl space-y-3 text-center md:text-left">
        <p className="text-[0.6rem] uppercase tracking-[0.3rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.6rem]">
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
              <p className="text-[0.65rem] uppercase tracking-[0.2rem] text-[var(--gold-tone)] sm:text-xs sm:tracking-[0.4rem]">
                {dateFormatter.format(eventDate)} • {upcomingEvent.time}
              </p>
              <h3 className="text-2xl font-semibold text-[var(--foreground)]">
                {upcomingEvent.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {upcomingEvent.description}
              </p>
            </div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2rem] text-[#f5d98c] sm:text-xs sm:tracking-[0.4rem]">
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

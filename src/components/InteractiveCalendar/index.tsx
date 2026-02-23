"use client";

import { useMemo, useState } from "react";

import type { EventHighlight } from "@/types/event";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface CalendarProps {
  events: EventHighlight[];
}

type ParsedEvent = EventHighlight & { dateObject: Date };

export function InteractiveCalendar({ events }: CalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const displayMonth = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [monthOffset]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdayOffset = new Date(year, month, 1).getDay();

  const parsedEvents = useMemo<ParsedEvent[]>(() => {
    return events.map((event) => ({
      ...event,
      dateObject: new Date(event.date),
    }));
  }, [events]);

  const eventsByDay = (() => {
    const map = new Map<number, ParsedEvent[]>();

    parsedEvents.forEach((event) => {
      const { dateObject } = event;
      if (
        dateObject.getFullYear() === year &&
        dateObject.getMonth() === month
      ) {
        const day = dateObject.getDate();
        const existing = map.get(day) ?? [];
        existing.push(event);
        map.set(day, existing);
      }
    });

    return map;
  })();

  const selectedDayEvents = eventsByDay.get(selectedDate.getDate()) ?? [];

  const formattedMonth = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
      displayMonth,
    );
  }, [displayMonth]);

  const changeMonth = (direction: "prev" | "next") => {
    setMonthOffset((prev) => prev + (direction === "next" ? 1 : -1));
  };

  const generateBlankDays = () => {
    return Array.from({ length: weekdayOffset }, (_, index) => index);
  };

  return (
    <div className="h-full rounded-[26px] border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 shadow-[0_20px_40px_var(--shadow)] sm:rounded-[30px] sm:p-5">
      <div className="mb-4 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.14rem] text-[#f5d98c] sm:text-xs sm:tracking-[0.4rem]">
        <button
          type="button"
          onClick={() => changeMonth("prev")}
          className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] text-[var(--gold-tone-dark)] transition hover:border-[var(--gold-tone-dark)]"
          aria-label="Mês anterior"
        >
          ◀
        </button>
        <span className="text-[0.75rem] font-semibold text-[var(--foreground)] sm:text-sm">{formattedMonth}</span>
        <button
          type="button"
          onClick={() => changeMonth("next")}
          className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] text-[var(--gold-tone-dark)] transition hover:border-[var(--gold-tone-dark)]"
          aria-label="Próximo mês"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[0.55rem] font-semibold tracking-[0.14rem] text-[var(--muted-foreground)] sm:text-[0.6rem] sm:tracking-[0.4rem]">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
        {generateBlankDays().map((blankIndex) => (
          <span key={`blank-${blankIndex}`} className="h-10" />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const isSelected =
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;
          const hasEvent = eventsByDay.has(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => setSelectedDate(new Date(year, month, day))}
            className={`relative flex h-10 items-center justify-center rounded-2xl border text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2A537]/70 sm:h-9 sm:text-sm ${
              isSelected
                ? "border-[var(--gold-tone)] bg-gradient-to-br from-[var(--gold-tone)]/90 to-[#D4B547]/80 text-black"
                : "border-transparent bg-white/5 text-[var(--foreground)]"
            } ${hasEvent ? "ring-2 ring-[#C2A537]/60 ring-offset-1" : ""}`}
            >
              {day}
              {hasEvent && (
                <span className="absolute -top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#C2A537]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
        <p className="text-[0.55rem] uppercase tracking-[0.14rem] text-[#f5d98c] sm:text-[0.6rem] sm:tracking-[0.5rem]">
          Eventos para {selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
        </p>
        {selectedDayEvents.length === 0 ? (
          <p className="text-xs text-[#c7b75d]">Nenhum evento marcado para este dia.</p>
        ) : (
          <div className="space-y-3">
            {selectedDayEvents.map((event) => (
            <article key={`${event.title}-${event.date}`} className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {event.title}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">{event.location}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

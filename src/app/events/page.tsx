import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_OG_IMAGE, SITE_LOCALE, SITE_NAME, SITE_URL } from "@/lib/seo";

type PublicEvent = {
  id?: string;
  title: string;
  slug: string;
  path: string;
  description: string;
  date: string;
  status?: "draft" | "published" | "cancelled";
  isFeatured?: boolean;
  time: string;
  endTime: string | null;
  location: string | null;
  thumbnailUrl: string | null;
  accessMode: "open" | "registered_only";
  capacity: number | null;
  confirmedRegistrations?: number;
  allowGuests: boolean;
  requiresConfirmation: boolean;
  isPaid: boolean;
  priceCents: number | null;
  paymentMethod: string | null;
};

type BirthdayEvent = {
  title: string;
  slug: string;
  path: string;
  description: string;
  date: string;
  time: string;
  endTime: string | null;
  location: string | null;
  thumbnailUrl: string | null;
};

type EventsPageProps = {
  searchParams?: Promise<{ birthMonth?: string }>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:3001";

const brDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const brCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Agenda de eventos da JM Fitness Studio com treinos especiais e experiencias exclusivas.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: `Eventos | ${SITE_NAME}`,
    description:
      "Agenda de eventos da JM Fitness Studio com treinos especiais e experiencias exclusivas.",
    url: `${SITE_URL}/events`,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Eventos | ${SITE_NAME}`,
    description:
      "Agenda de eventos da JM Fitness Studio com treinos especiais e experiencias exclusivas.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const isBirthdaySlug = (slug: string) => slug.startsWith("aniversario-");

const toEventPath = (slug: string) => `/events/event-${slug}`;
const normalizeEventStatus = (value?: string | null) =>
  value?.trim().toLowerCase() ?? "";
const isCancelledEvent = (event: PublicEvent) => {
  const normalizedStatus = normalizeEventStatus(event.status);
  return normalizedStatus === "cancelled" || normalizedStatus === "cancelado";
};
const isEventFull = (event: PublicEvent) =>
  event.capacity !== null &&
  Number(event.confirmedRegistrations ?? 0) >= event.capacity;

const monthRefRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;

const parseMonthRef = (monthRef?: string) => {
  const now = new Date();
  const fallback = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
  if (!monthRef) {
    return fallback;
  }
  const match = monthRefRegex.exec(monthRef.trim());
  if (!match) {
    return fallback;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
};

const toMonthRef = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const shiftMonthRef = (monthRef: string, delta: number) => {
  const parsed = parseMonthRef(monthRef);
  const date = new Date(parsed.year, parsed.month - 1, 1);
  date.setMonth(date.getMonth() + delta);
  return toMonthRef(date.getFullYear(), date.getMonth() + 1);
};

const monthFromDate = (dateText: string) => {
  const parsed = parseDate(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.getMonth() + 1;
};

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

const safeEventDate = (event: PublicEvent) => {
  const parsed = parseDate(event.date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const formatEventDate = (event: PublicEvent) => {
  const parsed = safeEventDate(event);
  if (!parsed) {
    return event.date;
  }
  return brDateFormatter.format(parsed);
};

const formatEventTime = (event: PublicEvent) => {
  if (event.endTime) {
    return `${event.time} - ${event.endTime}`;
  }
  return event.time;
};

const formatEventPrice = (event: PublicEvent) => {
  if (!event.isPaid) {
    return "Gratuito";
  }
  if (event.priceCents && event.priceCents > 0) {
    return brCurrencyFormatter.format(event.priceCents / 100);
  }
  return "Pago";
};

const getBirthdayEventsOfMonth = async (
  monthRef?: string,
): Promise<BirthdayEvent[]> => {
  const parsedMonth = parseMonthRef(monthRef);
  const targetMonth = parsedMonth.month;
  const normalizedMonthRef = toMonthRef(parsedMonth.year, parsedMonth.month);

  const normalizeBirthdayList = (rows: Array<BirthdayEvent | PublicEvent>) =>
    rows
      .filter((event) => isBirthdaySlug(event.slug))
      .filter((event) => monthFromDate(event.date) === targetMonth)
      .map((event) => ({
        title: event.title,
        slug: event.slug,
        path:
          "path" in event && event.path ? event.path : toEventPath(event.slug),
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: event.endTime,
        location: event.location,
        thumbnailUrl: event.thumbnailUrl,
      }));

  try {
    const response = await fetch(
      buildApiUrl(`/events/public/birthdays?month=${normalizedMonthRef}`),
      {
        next: { revalidate: 60 },
      },
    );
    if (response.ok) {
      const payload = (await response.json()) as BirthdayEvent[];
      return normalizeBirthdayList(payload);
    }
  } catch {}

  try {
    const fallbackResponse = await fetch(buildApiUrl("/events/public"), {
      next: { revalidate: 60 },
    });
    if (!fallbackResponse.ok) {
      return [];
    }
    const payload = (await fallbackResponse.json()) as PublicEvent[];
    return normalizeBirthdayList(payload);
  } catch {
    return [];
  }
};

const formatBirthdayDate = (event: BirthdayEvent) => {
  const parsed = parseDate(event.date);
  if (Number.isNaN(parsed.getTime())) {
    return event.date;
  }
  return brDateFormatter.format(parsed);
};

const getPublicEvents = async (): Promise<PublicEvent[]> => {
  const today = new Date();
  const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;

  try {
    const response = await fetch(
      buildApiUrl(`/events/public/cards?from=${from}&includeCancelled=1`),
      {
        cache: "no-store",
      },
    );
    if (response.ok) {
      const payload = (await response.json()) as PublicEvent[];
      return payload
        .slice()
        .filter((event) => !isBirthdaySlug(event.slug))
        .map((event) => ({
          ...event,
          path: event.path || toEventPath(event.slug),
        }))
        .sort((a, b) => {
          const aDate = safeEventDate(a)?.getTime() ?? 0;
          const bDate = safeEventDate(b)?.getTime() ?? 0;
          if (aDate !== bDate) {
            return aDate - bDate;
          }
          return a.time.localeCompare(b.time);
        });
    }
  } catch {}

  try {
    const fallbackResponse = await fetch(
      buildApiUrl(`/events/public?from=${from}&includeCancelled=1`),
      {
        cache: "no-store",
      },
    );
    if (!fallbackResponse.ok) {
      return [];
    }
    const payload = (await fallbackResponse.json()) as PublicEvent[];
    return payload
      .slice()
      .filter((event) => !isBirthdaySlug(event.slug))
      .map((event) => ({
        ...event,
        path: toEventPath(event.slug),
      }))
      .sort((a, b) => {
        const aDate = safeEventDate(a)?.getTime() ?? 0;
        const bDate = safeEventDate(b)?.getTime() ?? 0;
        if (aDate !== bDate) {
          return aDate - bDate;
        }
        return a.time.localeCompare(b.time);
      });
  } catch {
    return [];
  }
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const parsedSelectedMonth = parseMonthRef(resolvedSearchParams?.birthMonth);
  const selectedBirthMonthRef = toMonthRef(
    parsedSelectedMonth.year,
    parsedSelectedMonth.month,
  );
  const previousBirthMonthRef = shiftMonthRef(selectedBirthMonthRef, -1);
  const nextBirthMonthRef = shiftMonthRef(selectedBirthMonthRef, 1);
  const birthdayMonthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(
    new Date(parsedSelectedMonth.year, parsedSelectedMonth.month - 1, 1),
  );
  const birthdayMonthShortLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
  })
    .format(
      new Date(parsedSelectedMonth.year, parsedSelectedMonth.month - 1, 1),
    )
    .replace(".", "")
    .replace(" de ", "/")
    .toUpperCase();

  const [events, birthdayEvents] = await Promise.all([
    getPublicEvents(),
    getBirthdayEventsOfMonth(selectedBirthMonthRef),
  ]);

  const totalEvents = events.length;
  const paidEvents = events.filter((event) => event.isPaid).length;
  const openEvents = events.filter(
    (event) => event.accessMode === "open",
  ).length;
  const featuredEvent =
    events.find((event) => event.isFeatured && !isCancelledEvent(event)) ??
    events.find((event) => !isCancelledEvent(event)) ??
    null;
  const featuredEventKey = featuredEvent?.id ?? featuredEvent?.slug ?? null;
  const eventsForCards = events.filter((event) => {
    if (!featuredEventKey) {
      return true;
    }
    const eventKey = event.id ?? event.slug;
    return eventKey !== featuredEventKey;
  });

  return (
    <section className="min-h-[100dvh] bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-6 text-[var(--foreground)] sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_16px_40px_-20px_var(--shadow)] sm:p-6">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.4rem]">
            Agenda Oficial
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            Eventos JM Fitness
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--muted-foreground)] sm:text-base">
            Confira os proximos encontros, aulas especiais e experiencias da
            comunidade JM. O calendario e atualizado em tempo real pela equipe.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.16rem] text-[var(--foreground)] sm:text-xs sm:tracking-[0.24rem]">
              {totalEvents} eventos
            </span>
            <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.16rem] text-[var(--foreground)] sm:text-xs sm:tracking-[0.24rem]">
              {openEvents} abertos
            </span>
            <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-2 text-[0.65rem] uppercase tracking-[0.16rem] text-[var(--foreground)] sm:text-xs sm:tracking-[0.24rem]">
              {paidEvents} pagos
            </span>
          </div>
        </header>

        <section className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 shadow-[0_16px_40px_-20px_var(--shadow)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.35rem]">
                Aniversariantes do mes
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">
                Celebrando {birthdayMonthLabel}
              </h2>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12rem] text-[var(--muted-foreground)] sm:text-xs sm:tracking-[0.2rem]">
                {birthdayEvents.length} aniversariantes neste mes
              </p>
            </div>
            <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-end">
              <Link
                href={`/events?birthMonth=${previousBirthMonthRef}`}
                aria-label="Mes anterior"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] sm:w-auto sm:px-4 sm:text-xs"
              >
                <ChevronLeft className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">&lt; Anterior</span>
              </Link>
              <span className="inline-flex h-10 min-w-[5.6rem] items-center justify-center rounded-full border border-[var(--gold-tone)]/35 bg-[linear-gradient(180deg,rgba(181,140,33,0.14),rgba(181,140,33,0.06))] px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14rem] text-[var(--gold-tone-dark)] shadow-[0_10px_22px_-14px_var(--gold-tone)] sm:min-w-[6.4rem] sm:px-4 sm:text-[0.7rem] sm:tracking-[0.2rem]">
                {birthdayMonthShortLabel}
              </span>
              <Link
                href={`/events?birthMonth=${nextBirthMonthRef}`}
                aria-label="Próximo mes"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] sm:w-auto sm:px-4 sm:text-xs"
              >
                <ChevronRight className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Próximo &gt;</span>
              </Link>
            </div>
          </div>

          {birthdayEvents.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              Nenhum aniversariante publicado para este mes.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {birthdayEvents.map((event) => (
                <article
                  key={event.slug}
                  className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-3 sm:p-4"
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.28rem]">
                    {formatBirthdayDate(event)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {event.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        {featuredEvent ? (
          <article className="relative grid gap-5 overflow-hidden rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 shadow-[0_22px_52px_-28px_var(--shadow)] sm:p-4 md:grid-cols-[1.2fr_1fr] md:p-6">
            {isCancelledEvent(featuredEvent) && (
              <span className="pointer-events-none absolute -right-20 top-5 z-20 rotate-45 border border-[color:var(--danger-border)] bg-[color:var(--danger)] px-20 py-1 text-[0.52rem] font-bold uppercase tracking-[0.16rem] text-white shadow-[0_12px_26px_-14px_var(--shadow)] sm:-right-16 sm:top-6 sm:text-[0.58rem] sm:tracking-[0.28rem]">
                CANCELADO
              </span>
            )}
            <div className="relative h-56 overflow-hidden rounded-2xl border border-[color:var(--border-dim)] sm:h-72">
              <Image
                src={featuredEvent.thumbnailUrl || "/gym1.jpg"}
                alt={featuredEvent.title}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.35rem]">
                  Proximo em destaque
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {featuredEvent.title}
                </h2>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  {featuredEvent.description}
                </p>
              </div>

              <div className="grid gap-2 text-sm">
                <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                  <span className="font-semibold">Data:</span>{" "}
                  {formatEventDate(featuredEvent)}
                </p>
                <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                  <span className="font-semibold">Horario:</span>{" "}
                  {formatEventTime(featuredEvent)}
                </p>
                <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                  <span className="font-semibold">Valor:</span>{" "}
                  {formatEventPrice(featuredEvent)}
                </p>
                <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                  <span className="font-semibold">Inscricoes:</span>{" "}
                  {featuredEvent.accessMode === "open"
                    ? "Acesso livre"
                    : `${Number(featuredEvent.confirmedRegistrations ?? 0)}${
                        typeof featuredEvent.capacity === "number"
                          ? ` / ${featuredEvent.capacity}`
                          : ""
                      } confirmadas`}
                </p>
                <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                  <span className="font-semibold">Local:</span>{" "}
                  {featuredEvent.location || "Enviado apos confirmacao"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isCancelledEvent(featuredEvent) &&
                !isEventFull(featuredEvent) ? (
                  <>
                    <Link
                      href={featuredEvent.path}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-6 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)]"
                    >
                      Entrar para se inscrever
                    </Link>
                    <Link
                      href={featuredEvent.path}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-6 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                    >
                      Ver detalhes
                    </Link>
                  </>
                ) : (
                  <span
                    className={`inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold ${
                      isCancelledEvent(featuredEvent)
                        ? "border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
                        : "border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--foreground)]"
                    }`}
                  >
                    {isCancelledEvent(featuredEvent)
                      ? "Evento cancelado"
                      : "Evento lotado"}
                  </span>
                )}
              </div>
            </div>
          </article>
        ) : (
          <div className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-8 text-center shadow-[0_16px_40px_-20px_var(--shadow)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35rem] text-[var(--gold-tone-dark)]">
              Agenda vazia
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Nenhum evento publicado no momento
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--muted-foreground)]">
              Assim que a equipe publicar novos eventos, eles aparecerao aqui
              automaticamente. Eventos de aniversario aparecem apenas na secao
              de aniversariantes.
            </p>
          </div>
        )}

        {eventsForCards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventsForCards.map((event) => {
              const isCancelled = isCancelledEvent(event);
              const cardClasses = `group relative overflow-hidden rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] transition ${
                isCancelled
                  ? "cursor-default opacity-95"
                  : "hover:-translate-y-1 hover:border-[var(--gold-tone-dark)] hover:shadow-[0_18px_38px_-22px_var(--shadow)]"
              }`;
              const cardContent = (
                <>
                  {isCancelled && (
                    <span className="pointer-events-none absolute -right-16 top-5 z-20 rotate-45 border border-[color:var(--danger-border)] bg-[color:var(--danger)] px-16 py-1 text-[0.52rem] font-bold uppercase tracking-[0.14rem] text-white shadow-[0_10px_24px_-12px_var(--shadow)] sm:-right-14 sm:text-[0.58rem] sm:tracking-[0.25rem]">
                      CANCELADO
                    </span>
                  )}
                  <div className="relative h-40 border-b border-[color:var(--border-dim)]">
                    <Image
                      src={event.thumbnailUrl || "/gym2.jpg"}
                      alt={event.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className={`object-cover transition duration-500 ${
                        isCancelled ? "" : "group-hover:scale-105"
                      }`}
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[color:var(--border-dim)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2rem] text-[var(--gold-tone-dark)]">
                        {event.accessMode === "open" ? "Aberto" : "Inscricao"}
                      </span>
                      <span className="rounded-full border border-[color:var(--border-dim)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2rem] text-[var(--foreground)]">
                        {event.isPaid ? "Pago" : "Gratuito"}
                      </span>
                      {event.allowGuests && (
                        <span className="rounded-full border border-[color:var(--border-dim)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2rem] text-[var(--foreground)]">
                          Convidados
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-lg font-semibold text-[var(--foreground)]">
                      {event.title}
                    </h3>

                    <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
                      {event.description}
                    </p>

                    <div className="space-y-1 text-xs text-[var(--muted-foreground)]">
                      <p>{formatEventDate(event)}</p>
                      <p>{formatEventTime(event)}</p>
                      <p>
                        {event.location || "Local enviado apos confirmacao"}
                      </p>
                      <p>{formatEventPrice(event)}</p>
                      <p>
                        {event.accessMode === "open"
                          ? "Acesso livre"
                          : `${Number(event.confirmedRegistrations ?? 0)}${
                              typeof event.capacity === "number"
                                ? ` / ${event.capacity}`
                                : ""
                            } confirmadas`}
                      </p>
                    </div>
                  </div>
                </>
              );

              if (isCancelled) {
                return (
                  <article
                    key={`${event.slug}-${event.date}-${event.time}`}
                    className={cardClasses}
                  >
                    {cardContent}
                  </article>
                );
              }

              return (
                <Link
                  key={`${event.slug}-${event.date}-${event.time}`}
                  href={event.path}
                  className={cardClasses}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

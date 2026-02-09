import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

type PublicEvent = {
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  endTime: string | null;
  location: string | null;
  thumbnailUrl: string | null;
  accessMode: "open" | "registered_only";
  capacity: number | null;
  allowGuests: boolean;
  requiresConfirmation: boolean;
  isPaid: boolean;
  priceCents: number | null;
  paymentMethod: string | null;
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
};

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

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

const getPublicEvents = async (): Promise<PublicEvent[]> => {
  try {
    const today = new Date();
    const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(today.getDate()).padStart(2, "0")}`;
    const response = await fetch(buildApiUrl(`/events/public?from=${from}`), {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as PublicEvent[];
    return payload
      .slice()
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

export default async function EventsPage() {
  const events = await getPublicEvents();

  const totalEvents = events.length;
  const paidEvents = events.filter((event) => event.isPaid).length;
  const openEvents = events.filter((event) => event.accessMode === "open").length;
  const featuredEvent = events[0] ?? null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_16px_40px_-20px_var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-[var(--gold-tone-dark)]">
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
            <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-2 text-xs uppercase tracking-[0.24rem] text-[var(--foreground)]">
              {totalEvents} eventos
            </span>
            <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-2 text-xs uppercase tracking-[0.24rem] text-[var(--foreground)]">
              {openEvents} abertos
            </span>
            <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-2 text-xs uppercase tracking-[0.24rem] text-[var(--foreground)]">
              {paidEvents} pagos
            </span>
          </div>
        </header>

        {featuredEvent ? (
          <article className="grid gap-5 overflow-hidden rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 shadow-[0_22px_52px_-28px_var(--shadow)] md:grid-cols-[1.2fr_1fr] md:p-6">
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
                <p className="text-xs font-semibold uppercase tracking-[0.35rem] text-[var(--gold-tone-dark)]">
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
                  <span className="font-semibold">Local:</span>{" "}
                  {featuredEvent.location || "Enviado apos confirmacao"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/users/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-6 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)]"
                >
                  Entrar para se inscrever
                </Link>
                <Link
                  href="/checkin"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-6 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                >
                  Fazer check-in
                </Link>
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
              automaticamente.
            </p>
          </div>
        )}

        {events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={`${event.slug}-${event.date}-${event.time}`}
                className="group overflow-hidden rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] transition hover:-translate-y-1 hover:border-[var(--gold-tone-dark)] hover:shadow-[0_18px_38px_-22px_var(--shadow)]"
              >
                <div className="relative h-40 border-b border-[color:var(--border-dim)]">
                  <Image
                    src={event.thumbnailUrl || "/gym2.jpg"}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
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
                    <p>{event.location || "Local enviado apos confirmacao"}</p>
                    <p>{formatEventPrice(event)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

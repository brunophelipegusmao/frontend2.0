import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventRegistrationPanel } from "./EventRegistrationPanel";
import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  buildCanonicalUrl,
  resolveOgImage,
} from "@/lib/seo";

type PublicEventDetail = {
  title: string;
  slug: string;
  description: string;
  date: string;
  status?: "draft" | "published" | "cancelled";
  time: string;
  endTime: string | null;
  location?: string | null;
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

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
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

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const TIMEZONE_OFFSET = "-03:00";

const normalizeEventSlug = (rawSlug: string) => {
  const value = rawSlug.trim();
  if (!value) {
    return "";
  }
  if (value.startsWith("event-")) {
    return value.slice("event-".length);
  }
  return value;
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

const toIsoDateTime = (date: string, time?: string | null) => {
  if (!time) {
    return date;
  }
  const normalized = time.trim();
  if (!normalized) {
    return date;
  }
  if (normalized.includes("T")) {
    return normalized;
  }
  return `${date}T${normalized}${TIMEZONE_OFFSET}`;
};

const buildEventOgImages = (image?: string | null, altText?: string) => {
  if (!image) {
    return [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: altText || SITE_NAME,
      },
    ];
  }
  return [
    {
      url: image,
      alt: altText || SITE_NAME,
    },
  ];
};

const fetchPublicEvent = async (slug: string): Promise<PublicEventDetail | null> => {
  try {
    const response = await fetch(
      buildApiUrl(`/events/public/${encodeURIComponent(slug)}`),
      {
        next: { revalidate: 60 },
      },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PublicEventDetail;
  } catch {
    return null;
  }
};

const formatEventTime = (event: PublicEventDetail) => {
  if (event.endTime) {
    return `${event.time} - ${event.endTime}`;
  }
  return event.time;
};

const formatEventPrice = (event: PublicEventDetail) => {
  if (!event.isPaid) {
    return "Gratuito";
  }
  if (event.priceCents && event.priceCents > 0) {
    return brCurrencyFormatter.format(event.priceCents / 100);
  }
  return "Pago";
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeEventSlug(rawSlug);
  if (!slug) {
    return {
      title: "Evento",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const event = await fetchPublicEvent(slug);
  if (!event) {
    return {
      title: "Evento",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  const canonicalPath = `/events/${rawSlug}`;
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const description =
    event.description || "Detalhes de evento da agenda oficial JM Fitness.";

  return {
    title: event.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${event.title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: buildEventOgImages(event.thumbnailUrl, event.title),
      locale: SITE_LOCALE,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | ${SITE_NAME}`,
      description,
      images: [event.thumbnailUrl || DEFAULT_OG_IMAGE],
    },
    robots:
      event.status === "cancelled"
        ? {
            index: false,
            follow: false,
          }
        : {
            index: true,
            follow: true,
          },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeEventSlug(rawSlug);
  if (!slug) {
    notFound();
  }

  const event = await fetchPublicEvent(slug);
  if (!event) {
    notFound();
  }

  const parsedDate = parseDate(event.date);
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? event.date
    : brDateFormatter.format(parsedDate);
  const canonicalUrl = buildCanonicalUrl(`/events/${rawSlug}`);
  const offer =
    event.isPaid && event.priceCents
      ? {
          "@type": "Offer",
          price: (event.priceCents / 100).toFixed(2),
          priceCurrency: "BRL",
          availability: "https://schema.org/InStock",
          url: canonicalUrl,
        }
      : !event.isPaid
        ? {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: canonicalUrl,
          }
        : undefined;
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description:
      event.description || "Detalhes de evento da agenda oficial JM Fitness.",
    startDate: toIsoDateTime(event.date, event.time),
    endDate: event.endTime ? toIsoDateTime(event.date, event.endTime) : undefined,
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [resolveOgImage(event.thumbnailUrl || DEFAULT_OG_IMAGE)],
    location: {
      "@type": "Place",
      name: event.location || SITE_NAME,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Duque de Caxias",
        addressRegion: "RJ",
        addressCountry: "BR",
      },
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isAccessibleForFree: !event.isPaid,
    offers: offer,
  };

  return (
    <section className="min-h-[100dvh] bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_16px_40px_-20px_var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35rem] text-[var(--gold-tone-dark)]">
            Detalhes do evento
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            {event.title}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {event.description}
          </p>
        </header>

        <article className="overflow-hidden rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] shadow-[0_18px_46px_-24px_var(--shadow)]">
          <div className="relative h-64 border-b border-[color:var(--border-dim)] sm:h-80">
            <Image
              src={event.thumbnailUrl || "/gym3.jpg"}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Data:</span> {formattedDate}
            </p>
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Horario:</span>{" "}
              {formatEventTime(event)}
            </p>
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Acesso:</span>{" "}
              {event.accessMode === "open" ? "Aberto" : "Com inscricao"}
            </p>
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Inscricoes:</span>{" "}
              {event.accessMode === "open"
                ? "Acesso livre"
                : `${Number(event.confirmedRegistrations ?? 0)}${
                    typeof event.capacity === "number"
                      ? ` / ${event.capacity}`
                      : ""
                  } confirmadas`}
            </p>
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Valor:</span>{" "}
              {formatEventPrice(event)}
            </p>
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Convidados:</span>{" "}
              {event.allowGuests ? "Permitidos" : "Nao permitidos"}
            </p>
            <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm">
              <span className="font-semibold">Local:</span>{" "}
              {event.location || "Enviado apos confirmacao"}
            </p>
          </div>
        </article>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/events"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
          >
            Voltar para agenda
          </Link>
        </div>

        <Suspense fallback={null}>
          <EventRegistrationPanel
            slug={event.slug}
            eventPath={`/events/event-${event.slug}`}
            accessMode={event.accessMode}
            capacity={event.capacity}
            confirmedRegistrations={Number(event.confirmedRegistrations ?? 0)}
            allowGuests={event.allowGuests}
            isCancelled={event.status === "cancelled"}
          />
        </Suspense>
      </div>
    </section>
  );
}

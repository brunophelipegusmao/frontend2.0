import type { Metadata } from "next";
import Link from "next/link";
import {
  ExternalLink,
  Facebook,
  Globe2,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import {
  DEFAULT_OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  resolveOgImage,
  toE164Phone,
} from "@/lib/seo";

type OperatingSegment = { start: string; end: string };
type OperatingHours = { day: string; segments: OperatingSegment[] };

type SystemSettingsResponse = {
  contact?: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    phone?: string | null;
  } | null;
  socialLinks?: Record<string, string | null> | null;
  operatingHours?: OperatingHours[] | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:3001";

const FALLBACK_CONTACT = {
  address: "Rua General Câmara, 18, sala 311",
  city: "Duque de Caxias",
  state: "RJ",
  zipCode: null,
  phone: "(21) 98099-5749",
};

const FALLBACK_EMAIL = "atendimento@jmfitness.com.br";

const FALLBACK_HOURS: OperatingHours[] = [
  { day: "monday", segments: [{ start: "06:00", end: "22:00" }] },
  { day: "tuesday", segments: [{ start: "06:00", end: "22:00" }] },
  { day: "wednesday", segments: [{ start: "06:00", end: "22:00" }] },
  { day: "thursday", segments: [{ start: "06:00", end: "22:00" }] },
  { day: "friday", segments: [{ start: "06:00", end: "22:00" }] },
  { day: "saturday", segments: [{ start: "08:00", end: "18:00" }] },
  { day: "sunday", segments: [{ start: "08:00", end: "14:00" }] },
];

const DAY_LABELS: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const SCHEMA_DAY_OF_WEEK: Record<string, string> = {
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
};

const buildOpeningHoursSpecification = (hours: OperatingHours[]) =>
  hours
    .flatMap((entry) =>
      (entry.segments ?? []).map((segment) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAY_OF_WEEK[entry.day],
        opens: segment.start,
        closes: segment.end,
      })),
    )
    .filter(
      (item) => item.dayOfWeek && item.opens && item.closes,
    );

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a equipe da JM Fitness Studio e confira horários de funcionamento e redes oficiais.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: `Contato | ${SITE_NAME}`,
    description:
      "Fale com a equipe da JM Fitness Studio e confira horários de funcionamento e redes oficiais.",
    url: `${SITE_URL}/contacts`,
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
    title: `Contato | ${SITE_NAME}`,
    description:
      "Fale com a equipe da JM Fitness Studio e confira horários de funcionamento e redes oficiais.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const normalizeText = (value?: string | null) => value?.trim() || "";

const hasValue = (value?: string | null) => normalizeText(value).length > 0;

const formatAddress = (contact: SystemSettingsResponse["contact"]) => {
  const address = normalizeText(contact?.address);
  const city = normalizeText(contact?.city);
  const state = normalizeText(contact?.state);
  const zipCode = normalizeText(contact?.zipCode);

  const cityState = [city, state].filter(Boolean).join(" - ");
  const line2 = [zipCode, cityState].filter(Boolean).join(" • ");
  return {
    line1: address,
    line2,
  };
};

const toTelHref = (phone?: string | null) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  return `tel:+55${digits}`;
};

const toWhatsappHref = (phone?: string | null) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  const withCountryCode =
    digits.startsWith("55") || digits.length > 11 ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
};

const toMapsHref = (addressLine: string) => {
  if (!addressLine.trim()) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressLine,
  )}`;
};

const socialLabel = (key: string) => {
  const normalized = key.trim().toLowerCase();
  if (normalized === "instagram") return "Instagram";
  if (normalized === "facebook") return "Facebook";
  if (normalized === "youtube") return "YouTube";
  if (normalized === "tiktok") return "TikTok";
  return key
    .replace(/[_-]+/g, " ")
    .replace(/(^\w)|(\s+\w)/g, (m) => m.toUpperCase());
};

const getSocialIcon = (key: string) => {
  const normalized = key.trim().toLowerCase();
  if (normalized === "instagram") return Instagram;
  if (normalized === "facebook") return Facebook;
  if (normalized === "youtube") return Youtube;
  return Globe2;
};

const formatSegments = (segments: OperatingSegment[]) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return "Fechado";
  }
  return segments.map((segment) => `${segment.start} - ${segment.end}`).join(" • ");
};

const getSettings = async (): Promise<SystemSettingsResponse | null> => {
  try {
    const response = await fetch(buildApiUrl("/system-settings"), {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SystemSettingsResponse;
  } catch {
    return null;
  }
};

export default async function ContactsPage() {
  const settings = await getSettings();

  const contact = settings?.contact ?? FALLBACK_CONTACT;
  const phone = hasValue(contact?.phone) ? contact?.phone : FALLBACK_CONTACT.phone;
  const telHref = toTelHref(phone);
  const whatsappHref = toWhatsappHref(phone);
  const addressParts = formatAddress(contact);
  const mapsHref = toMapsHref(
    [addressParts.line1, addressParts.line2].filter(Boolean).join(", "),
  );

  const socialLinks = Object.entries(settings?.socialLinks ?? {})
    .filter(([, value]) => hasValue(value))
    .map(([key, value]) => ({
      key,
      href: value as string,
      label: socialLabel(key),
      Icon: getSocialIcon(key),
    }));

  const operatingHours =
    settings?.operatingHours && settings.operatingHours.length > 0
      ? settings.operatingHours
      : FALLBACK_HOURS;
  const openingHoursSpecification = buildOpeningHoursSpecification(operatingHours);
  const schemaAddress = {
    "@type": "PostalAddress",
    streetAddress: addressParts.line1 || undefined,
    addressLocality: contact.city || undefined,
    addressRegion: contact.state || undefined,
    postalCode: contact.zipCode || undefined,
    addressCountry: "BR",
  };
  const sameAs = socialLinks.map((link) => link.href);
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Fale com a equipe da JM Fitness Studio e confira horários de funcionamento e redes oficiais.",
    image: [resolveOgImage(DEFAULT_OG_IMAGE)],
    telephone: toE164Phone(phone),
    email: FALLBACK_EMAIL,
    address: schemaAddress,
    openingHoursSpecification:
      openingHoursSpecification.length > 0 ? openingHoursSpecification : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <header className="relative overflow-hidden rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-6 py-8 shadow-[0_18px_46px_-24px_var(--shadow)] sm:px-8">
        <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[var(--gold-tone)]/15 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.34rem] text-[var(--gold-tone-dark)]">
          Contato JM
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
          Estamos prontos para te atender
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[var(--muted-foreground)] sm:text-base">
          Fale com nossa equipe para tirar dúvidas sobre planos, eventos e rotinas.
          Nesta página você encontra nossos canais oficiais e horários de operação.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_18px_44px_-24px_var(--shadow)] sm:p-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4">
              <p className="text-xs uppercase tracking-[0.32rem] text-[var(--gold-tone-dark)]">
                Endereço
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                {addressParts.line1 || "Endereço não informado"}
              </p>
              {addressParts.line2 && (
                <p className="text-sm text-[var(--muted-foreground)]">{addressParts.line2}</p>
              )}
              {mapsHref && (
                <Link
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--gold-tone-dark)] underline-offset-4 hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  Abrir no mapa
                </Link>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4">
                <p className="text-xs uppercase tracking-[0.32rem] text-[var(--gold-tone-dark)]">
                  Telefone / WhatsApp
                </p>
                {phone ? (
                  whatsappHref ? (
                    <Link
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-[var(--foreground)] transition hover:text-[var(--gold-tone-dark)]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {phone}
                    </Link>
                  ) : (
                    <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{phone}</p>
                  )
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Telefone não informado
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4">
                <p className="text-xs uppercase tracking-[0.32rem] text-[var(--gold-tone-dark)]">
                  Ligação direta
                </p>
                {telHref ? (
                  <Link
                    href={telHref}
                    className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-[var(--foreground)] transition hover:text-[var(--gold-tone-dark)]"
                  >
                    <Phone className="h-4 w-4" />
                    Ligar para o estúdio
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Telefone não informado
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4">
              <p className="text-xs uppercase tracking-[0.32rem] text-[var(--gold-tone-dark)]">
                E-mail
              </p>
              <Link
                href={`mailto:${FALLBACK_EMAIL}`}
                className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-[var(--foreground)] transition hover:text-[var(--gold-tone-dark)]"
              >
                <ExternalLink className="h-4 w-4" />
                {FALLBACK_EMAIL}
              </Link>
            </div>
          </div>
        </article>

        <div className="grid gap-5">
          <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_18px_44px_-24px_var(--shadow)] sm:p-6">
            <p className="text-xs uppercase tracking-[0.32rem] text-[var(--gold-tone-dark)]">
              Horário de funcionamento
            </p>
            <div className="mt-4 grid gap-2">
              {operatingHours.map((entry) => (
                <div
                  key={entry.day}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-[var(--foreground)]">
                    {DAY_LABELS[entry.day] || entry.day}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {formatSegments(entry.segments)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_18px_44px_-24px_var(--shadow)] sm:p-6">
            <p className="text-xs uppercase tracking-[0.32rem] text-[var(--gold-tone-dark)]">
              Redes sociais
            </p>
            {socialLinks.length > 0 ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {socialLinks.map((social) => (
                  <Link
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--gold-tone)]/45 hover:text-[var(--gold-tone-dark)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <social.Icon className="h-4 w-4" />
                      {social.label}
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                Nenhuma rede social cadastrada no momento.
              </p>
            )}
          </article>
        </div>
      </div>

    </section>
  );
}

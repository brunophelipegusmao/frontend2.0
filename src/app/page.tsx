import type { Metadata } from "next";
import { EventsSection } from "@/components/EventsSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PlansSection, type PlanOption } from "@/components/PlansSection";
import { DEFAULT_HERO_SLIDES, PLAN_PERKS_BY_KEY, type HeroSlide } from "@/constants/home";
import type { EventHighlight } from "@/types/event";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  resolveOgImage,
  toE164Phone,
} from "@/lib/seo";
import { isHiddenPlanSlug } from "@/lib/plans";

type CarouselImage = { imageUrl: string; altText?: string | null };

type ApiEvent = {
  id?: string;
  title: string;
  slug?: string;
  path?: string;
  date: string;
  status?: "draft" | "published" | "cancelled";
  isFeatured?: boolean;
  time: string;
  endTime?: string | null;
  description: string;
  location: string | null;
  thumbnailUrl: string | null;
};

type ApiPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  promoPriceCents: number | null;
  promoActive: boolean;
  promoEndsAt: string | null;
  popular: boolean;
  durationDays: number | null;
};

type SystemSettingsResponse = {
  contact?: {
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    phone?: string | null;
  } | null;
  socialLinks?: Record<string, string | null> | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.API_URL ||
  "http://127.0.0.1:3001";

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const fetchJson = async <T,>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(buildApiUrl(path), {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const FALLBACK_CONTACT = {
  address: "Rua General Câmara, 18, sala 311",
  city: "Duque de Caxias",
  state: "RJ",
  zipCode: null,
  phone: "(21) 98099-5749",
};

const normalizeSocialLinks = (socialLinks?: Record<string, string | null>) =>
  Object.values(socialLinks ?? {})
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

const getSystemSettings = async (): Promise<SystemSettingsResponse | null> =>
  fetchJson<SystemSettingsResponse>("/system-settings");

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | Estúdio de Saúde e Bem-Estar`,
    description:
      "Treinos boutique, eventos exclusivos e planos pensados para sua rotina em Duque de Caxias.",
    url: SITE_URL,
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
    title: `${SITE_NAME} | Estúdio de Saúde e Bem-Estar`,
    description:
      "Treinos boutique, eventos exclusivos e planos pensados para sua rotina em Duque de Caxias.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const formatPlanPrice = (plan: ApiPlan) => {
  const now = new Date();
  const promoValid =
    plan.promoActive &&
    plan.promoPriceCents !== null &&
    (!plan.promoEndsAt || new Date(plan.promoEndsAt) >= now);
  const priceCents = promoValid ? plan.promoPriceCents : plan.priceCents;
  const hasPrice = priceCents !== null && priceCents !== undefined;
  const priceLabel = hasPrice
    ? currencyFormatter.format(priceCents / 100)
    : "Consulte";
  const durationLabel =
    plan.durationDays && plan.durationDays >= 28 && plan.durationDays <= 31
      ? "mês"
      : plan.durationDays
        ? `${plan.durationDays} dias`
        : "mês";
  return `${priceLabel}/${durationLabel}`;
};

const resolvePlanPerks = (plan: ApiPlan) => {
  const key = normalizeKey(plan.slug || plan.name);
  return PLAN_PERKS_BY_KEY[key] ?? [];
};

const getCarouselSlides = async (): Promise<HeroSlide[]> => {
  let images: CarouselImage[] | null = null;
  try {
    const response = await fetch(buildApiUrl("/system-settings/carousel"), {
      cache: "no-store",
    });
    if (response.ok) {
      images = (await response.json()) as CarouselImage[];
    }
  } catch {
    images = null;
  }

  const configuredImages = (images ?? [])
    .filter(
      (image): image is CarouselImage =>
        typeof image?.imageUrl === "string" && image.imageUrl.trim().length > 0,
    )
    .map((image) => ({
      ...image,
      imageUrl: image.imageUrl.trim(),
      altText: image.altText?.trim() ?? null,
    }));

  if (configuredImages.length === 0) {
    return DEFAULT_HERO_SLIDES;
  }

  return configuredImages.map((image, index) => {
    const fallback = DEFAULT_HERO_SLIDES[index % DEFAULT_HERO_SLIDES.length];
    return {
      src: image.imageUrl,
      title: image.altText || fallback.title,
      description: fallback.description,
    };
  });
};

const getEvents = async (): Promise<EventHighlight[]> => {
  const today = formatDateInput(new Date());
  const mapToHighlight = (events: ApiEvent[]) =>
    events.map((event) => ({
      id: event.id,
      slug: event.slug,
      status: event.status,
      isFeatured: event.isFeatured === true,
      path: event.path,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location ?? "Local a confirmar",
      description: event.description ?? "Evento exclusivo JM Fitness.",
      image: event.thumbnailUrl ?? "/gym1.jpg",
    }));

  const cards = await fetchJson<ApiEvent[]>(
    `/events/public/cards?from=${today}&includeCancelled=1`,
  );
  if (cards) {
    return mapToHighlight(cards);
  }

  const fallback = await fetchJson<ApiEvent[]>(
    `/events/public?from=${today}&includeCancelled=1`,
  );
  if (!fallback) {
    return [];
  }

  return mapToHighlight(fallback);
};

const getPlans = async (): Promise<PlanOption[]> => {
  const response = await fetchJson<ApiPlan[]>("/plans");
  if (!response) {
    return [];
  }
  return response
    .filter((plan) => !isHiddenPlanSlug(plan.slug))
    .map((plan) => ({
      id: plan.id,
      title: plan.name,
      price: formatPlanPrice(plan),
      description: plan.description ?? "Plano desenvolvido para sua rotina.",
      perks: resolvePlanPerks(plan),
      featured: plan.popular ?? false,
      badge: plan.popular ? "Mais procurado" : undefined,
    }));
};

export default async function Home() {
  const [slides, events, plans, settings] = await Promise.all([
    getCarouselSlides(),
    getEvents(),
    getPlans(),
    getSystemSettings(),
  ]);
  const contact = settings?.contact ?? FALLBACK_CONTACT;
  const sameAs = normalizeSocialLinks(settings?.socialLinks ?? undefined);
  const addressLine = contact.address?.trim();
  const addressLocality = contact.city?.trim();
  const addressRegion = contact.state?.trim();
  const postalCode = contact.zipCode?.trim() || undefined;
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: [resolveOgImage(DEFAULT_OG_IMAGE)],
    telephone: toE164Phone(contact.phone),
    address: {
      "@type": "PostalAddress",
      streetAddress: addressLine || undefined,
      addressLocality: addressLocality || undefined,
      addressRegion: addressRegion || undefined,
      postalCode,
      addressCountry: "BR",
    },
    areaServed: addressLocality
      ? {
          "@type": "City",
          name: addressLocality,
        }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "pt-BR",
  };

  return (
    <div className="flex flex-col gap-14 pb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, websiteSchema]),
        }}
      />
      <HeroCarousel slides={slides} />
      <EventsSection events={events} />
      <PlansSection plans={plans} />
    </div>
  );
}

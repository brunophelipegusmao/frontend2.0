import { EventsSection } from "@/components/EventsSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PlansSection, type PlanOption } from "@/components/PlansSection";
import { DEFAULT_HERO_SLIDES, PLAN_PERKS_BY_KEY, type HeroSlide } from "@/constants/home";
import type { EventHighlight } from "@/types/event";

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
  return response.map((plan) => ({
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
  const [slides, events, plans] = await Promise.all([
    getCarouselSlides(),
    getEvents(),
    getPlans(),
  ]);

  return (
    <div className="flex flex-col gap-14 pb-6">
      <HeroCarousel slides={slides} />
      <EventsSection events={events} />
      <PlansSection plans={plans} />
    </div>
  );
}

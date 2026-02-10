import type { MetadataRoute } from "next";
import { buildCanonicalUrl } from "@/lib/seo";

type PublicEvent = {
  slug?: string;
  date?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:3001";

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const getPublicEvents = async (): Promise<PublicEvent[]> => {
  try {
    const response = await fetch(buildApiUrl("/events/public"), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as PublicEvent[];
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events] = await Promise.all([getPublicEvents()]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: buildCanonicalUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildCanonicalUrl("/events"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl("/contacts"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const eventEntries: MetadataRoute.Sitemap = events.flatMap((event) => {
    const slug = event.slug?.trim();
    if (!slug) {
      return [];
    }
    const entry: MetadataRoute.Sitemap[number] = {
      url: buildCanonicalUrl(`/events/event-${encodeURIComponent(slug)}`),
      lastModified: event.date ? new Date(event.date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
    return [entry];
  });

  return [...staticEntries, ...eventEntries];
}

export interface EventHighlight {
  id?: string;
  slug?: string;
  status?: "draft" | "published" | "cancelled";
  isFeatured?: boolean;
  path?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
}

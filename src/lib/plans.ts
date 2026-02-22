const HIDDEN_PLAN_SLUGS = new Set(["master", "free", "padrao"]);

export const isHiddenPlanSlug = (slug?: string | null) => {
  if (typeof slug !== "string") {
    return false;
  }
  return HIDDEN_PLAN_SLUGS.has(slug.trim().toLowerCase());
};

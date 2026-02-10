export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jmfitnessstudio.com.br";
export const SITE_NAME = "JM Fitness Studio";
export const SITE_DESCRIPTION =
  "JM Fitness Studio em Duque de Caxias reúne treinos boutique, eventos exclusivos e um calendário vivo para sua evolução.";
export const SITE_LOCALE = "pt_BR";
export const DEFAULT_OG_IMAGE = "/banner-01.png";

export const buildCanonicalUrl = (path = "/") =>
  new URL(path, SITE_URL).toString();

export const resolveOgImage = (image?: string | null) => {
  if (!image) {
    return buildCanonicalUrl(DEFAULT_OG_IMAGE);
  }
  try {
    return new URL(image, SITE_URL).toString();
  } catch {
    return buildCanonicalUrl(DEFAULT_OG_IMAGE);
  }
};

export const toE164Phone = (phone?: string | null) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `+${withCountry}`;
};

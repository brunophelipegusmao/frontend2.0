export const toPtBrUpper = (value?: string | null) =>
  (value ?? "").trim().toLocaleUpperCase("pt-BR");

export const resolveUserDisplayName = (
  options: {
    name?: string | null;
    email?: string | null;
    fallback?: string;
  } = {},
) => {
  const base =
    options.name?.trim() ||
    options.email?.trim() ||
    options.fallback ||
    "USUÁRIO";

  return base.toLocaleUpperCase("pt-BR");
};

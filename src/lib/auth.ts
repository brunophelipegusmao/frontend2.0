type AuthResult<T> =
  | { ok: true; data: T | null }
  | { ok: false; error: string };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const AUTH_BASE_PATH = "/api/auth";

const buildAuthUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${AUTH_BASE_PATH}${normalizedPath}`;
};

const parseAuthError = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data?.message || data?.error || "Nao foi possivel completar a solicitacao.";
  } catch {
    return "Nao foi possivel completar a solicitacao.";
  }
};

const postAuth = async <T>(
  path: string,
  body: Record<string, unknown>,
): Promise<AuthResult<T>> => {
  const response = await fetch(buildAuthUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return { ok: false, error: await parseAuthError(response) };
  }

  try {
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: true, data: null };
  }
};

export const buildSocialSignInUrl = (provider: string) =>
  buildAuthUrl(`/sign-in/social?provider=${encodeURIComponent(provider)}`);

export const startSocialSignIn = async (provider: string) => {
  const result = await postAuth<{ redirect?: boolean; url?: string }>(
    "sign-in/social",
    { provider },
  );

  if (result.ok) {
    const url = result.data?.url;
    if (url) {
      window.location.href = url;
    }
  }

  return result;
};

export const signInWithEmail = (email: string, password: string) =>
  postAuth<{ token: string | null }>("sign-in/email", { email, password });

export const signUpWithEmail = (name: string, email: string, password: string) =>
  postAuth<{ token: string | null }>("sign-up/email", { name, email, password });

export const requestPasswordReset = (email: string, redirectTo: string) =>
  postAuth<{ status: boolean; message?: string }>("request-password-reset", {
    email,
    redirectTo,
  });

export const resetPassword = (token: string, newPassword: string) =>
  postAuth<{ status: boolean }>("reset-password", {
    token,
    newPassword,
  });

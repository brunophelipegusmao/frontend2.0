"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { signInWithEmail, startSocialSignIn } from "@/lib/auth";
import { API_BASE_URL, redirectBasedOnRole } from "@/lib/roleRedirect";

type EventRegistrationResponse = {
  status?: "pending" | "confirmed" | "waitlisted";
};

const parseApiError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message[0];
    }
    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }
    if (typeof data?.error === "string" && data.error.trim().length > 0) {
      return data.error;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

const sanitizeEventPath = (rawPath: string | null, eventSlug: string) => {
  if (rawPath && rawPath.startsWith("/events/")) {
    return rawPath;
  }
  return `/events/event-${eventSlug}`;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId =
    searchParams.get("planId") ?? searchParams.get("plan_id") ?? undefined;
  const eventSlug = (searchParams.get("eventSlug") ?? "").trim();
  const eventPath = searchParams.get("eventPath");
  const shouldAutoRegisterEvent =
    searchParams.get("registerAfterLogin") === "1" && eventSlug.length > 0;
  const autoRegisterRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const completeEventRegistration = useCallback(async () => {
    if (!shouldAutoRegisterEvent) {
      await redirectBasedOnRole(router);
      return;
    }

    const safeEventPath = sanitizeEventPath(eventPath, eventSlug);
    const buildReturnPath = (status: string, message?: string) => {
      const url = new URL(safeEventPath, window.location.origin);
      url.searchParams.set("registrationStatus", status);
      if (message && message.trim().length > 0) {
        url.searchParams.set("registrationMessage", message);
      }
      return `${url.pathname}${url.search}`;
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/events/public/${encodeURIComponent(eventSlug)}/register`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          const message = await parseApiError(
            response,
            "Nao foi possivel concluir a inscricao no evento.",
          );
          const duplicateRegistration =
            /ja esta inscrito/i.test(message) ||
            /inscricao ja existente/i.test(message);
          if (duplicateRegistration) {
            router.replace(buildReturnPath("already"));
            return;
          }
          router.replace(buildReturnPath("error", message));
          return;
        }
        if (response.status === 401 || response.status === 403) {
          router.replace(
            buildReturnPath(
              "auth_error",
              "Sessao expirada. Entre novamente para se inscrever.",
            ),
          );
          return;
        }
        const message = await parseApiError(
          response,
          "Nao foi possivel concluir a inscricao no evento.",
        );
        router.replace(buildReturnPath("error", message));
        return;
      }

      const payload = (await response.json()) as EventRegistrationResponse;
      const status = payload.status ?? "confirmed";
      router.replace(buildReturnPath(status));
    } catch {
      router.replace(
        buildReturnPath("error", "Falha ao comunicar com o servidor."),
      );
    }
  }, [eventPath, eventSlug, router, shouldAutoRegisterEvent]);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me/status`, {
          credentials: "include",
        });
        if (!response.ok || !active) {
          return;
        }
        if (shouldAutoRegisterEvent && !autoRegisterRef.current) {
          autoRegisterRef.current = true;
          await completeEventRegistration();
          return;
        }
        await redirectBasedOnRole(router);
      } catch {
        // ignore
      }
    };
    checkSession();
    return () => {
      active = false;
    };
  }, [completeEventRegistration, router, shouldAutoRegisterEvent]);

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);

    const origin = window.location.origin;
    const callbackURL = shouldAutoRegisterEvent
      ? window.location.href
      : `${origin}/users/login`;
    const completeProfileUrl = new URL("/complete-profile", origin);
    if (planId) {
      completeProfileUrl.searchParams.set("planId", planId);
    }

    const result = await startSocialSignIn("google", {
      planId,
      callbackURL,
      newUserCallbackURL: completeProfileUrl.toString(),
    });

    if (!result.ok) {
      if (
        result.error?.includes("State Mismatch") ||
        result.error?.includes("Verification not found")
      ) {
        setError(
          "Parece que o fluxo OAuth expirou. Recarregue a página e tente novamente clicando no botão Google sem abrir a URL de callback diretamente.",
        );
      } else {
        setError(result.error);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Preencha email e senha para continuar.");
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithEmail(trimmedEmail, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (shouldAutoRegisterEvent) {
      setSuccess("Login realizado. Finalizando inscricao no evento...");
      await completeEventRegistration();
      return;
    }

    setSuccess("Login realizado com sucesso.");
    await redirectBasedOnRole(router);
  };

  return (
    <AuthCard
      title="Conecte-se à sua conta"
      description="Conecte-se com sua conta "
      footer={
        <>
          Novo por aqui?{" "}
          <a
            href={`/users/register${planId ? `?planId=${encodeURIComponent(planId)}` : ""}`}
            className="font-semibold text-[var(--gold-tone-dark)]"
          >
            Cadastre-se
          </a>
        </>
      }
    >
      {shouldAutoRegisterEvent && (
        <p className="mb-4 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
          Entre na sua conta para concluir automaticamente a inscricao no evento.
        </p>
      )}

      <div className="mt-6 space-y-4 font-[var(--font-roboto)]">
        <GoogleLoginButton
          label="Entrar com Google"
          onClick={handleGoogleLogin}
        />
      </div>

      <div className="mt-6 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.5rem] text-[var(--muted-foreground)] font-[var(--font-roboto)]">
        <span className="h-px flex-1 bg-[color:var(--border-dim)] font-[var(--font-roboto)]" />
        <span className="font-bold text-md text-[var(--gold-tone)] font-[var(--font-roboto)]">
          Ou continue com
        </span>
        <span className="h-px flex-1 bg-[color:var(--border-dim)] font-[var(--font-roboto)] " />
      </div>

      <form
        className="mt-6 space-y-4 text-left font-[var(--font-roboto)]"
        onSubmit={handleSubmit}
      >
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)] font-[var(--font-roboto)]">
          E-mail
          <input
            type="email"
            name="email"
            placeholder="Digite seu email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none font-[var(--font-roboto)]"
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)] font-[var(--font-roboto)]">
            <label htmlFor="password">Senha</label>
            <a
              href="/users/forgot-password"
              className="text-[0.65rem] font-semibold normal-case tracking-normal text-[var(--gold-tone)] font-[var(--font-roboto)]"
            >
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none font-[var(--font-roboto)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] font-[var(--font-roboto)] text-[var(--gold-tone)]"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : success ? (
          <p className="text-sm text-emerald-300">{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.4rem] text-[var(--gold-tone)] transition hover:border-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70 font-[var(--font-roboto)]"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthCard>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard } from "@/components/AuthCard";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { signInWithEmail, startSocialSignIn } from "@/lib/auth";
import { API_BASE_URL, redirectBasedOnRole } from "@/lib/roleRedirect";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId =
    searchParams.get("planId") ?? searchParams.get("plan_id") ?? undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        await redirectBasedOnRole(router);
      } catch {
        // ignore
      }
    };
    checkSession();
    return () => {
      active = false;
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccess(null);

    const origin = window.location.origin;
    const callbackURL = `${origin}/users/login`;
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

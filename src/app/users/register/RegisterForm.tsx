"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { AuthCard } from "@/components/AuthCard";
import { signUpWithEmail, startSocialSignIn } from "@/lib/auth";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId =
    searchParams.get("planId") ??
    searchParams.get("plan_id") ??
    undefined;
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialErrorCount, setSocialErrorCount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{6,}$/;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    if (!passwordPattern.test(password)) {
      setError(
        "Senha inválida: use pelo menos 6 caracteres, com maiúscula, minúscula, número e símbolo.",
      );
      return;
    }

    setIsSubmitting(true);
    const result = await signUpWithEmail(
      trimmedName,
      trimmedEmail,
      password,
      planId,
    );
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess("Cadastro realizado com sucesso.");
    router.push("/");
  };

  const handleGoogleRegister = async () => {
    setSocialError(null);
    const origin = window.location.origin;
    const callbackURL = `${origin}/complete-profile`;
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
        setSocialError(
          "Recarregue a página e tente novamente clicando no botão Google.",
        );
        setSocialErrorCount((count) => count + 1);
        console.warn("Google social login failed with state mismatch:", {
          error: result.error,
          stateHint: result.error
            ?.match(/state=([^&\s]+)/)
            ?.toString()
            ?.replace("state=", ""),
        });
      } else {
        setSocialError(result.error);
      }
    }
  };

  return (
    <AuthCard
      title="Criar conta"
      description="Preencha seus dados para acessar o nosso painel."
      footer={
        <>
          Ja possui conta?{" "}
          <a
            href={`/users/login${planId ? `?planId=${encodeURIComponent(planId)}` : ""}`}
            className="font-semibold text-[var(--gold-tone-dark)]"
          >
            Entrar
          </a>
        </>
      }
    >
      <div className="mt-6 space-y-4 font-[var(--font-nunito-sans)]">
        <GoogleLoginButton
          label="Continuar com Google"
          onClick={handleGoogleRegister}
        />
        {socialError ? (
        <p className="text-sm text-red-400">{socialError}</p>
        ) : null}
        {socialErrorCount > 0 && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {socialErrorCount} tentativa{socialErrorCount === 1 ? "" : "s"} com Google
            falhou neste carregamento. Isso ajuda a identificar instabilidades no
            fluxo OAuth.
          </div>
        )}
      </div>

      <form
        className="mt-6 space-y-4 text-left font-[var(--font-nunito-sans)]"
        onSubmit={handleSubmit}
      >
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
          Nome
          <input
            type="text"
            name="name"
            placeholder="Digite seu nome"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none font-[var(--font-nunito-sans)]"
          />
        </label>

        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
          Email
          <input
            type="email"
            name="email"
            placeholder="Digite seu email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none font-[var(--font-nunito-sans)]"
          />
        </label>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none font-[var(--font-nunito-sans)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
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

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]"
          >
            Confirmar senha
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repita sua senha"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none font-[var(--font-nunito-sans)]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-label={
                showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
              }
            >
              {showConfirmPassword ? (
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
        <p className="text-[0.65rem] text-[var(--muted-foreground)]">
          Os dados de saúde serão solicitados após a confirmação do pagamento
          do plano.
        </p>
        {!passwordPattern.test(password) && password ? (
          <p className="text-[0.65rem] text-red-400">
            A senha deve ter ao menos 6 caracteres e incluir maiúscula, minúscula,
            número e símbolo.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.4rem] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70 font-[var(--font-nunito-sans)]"
        >
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </AuthCard>
  );
}

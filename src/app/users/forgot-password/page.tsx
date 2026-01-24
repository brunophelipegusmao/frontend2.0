"use client";

import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/AuthCard";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Informe seu email para continuar.");
      return;
    }

    const redirectTo = `${window.location.origin}/users/reset-password`;

    setIsSubmitting(true);
    const result = await requestPasswordReset(trimmedEmail, redirectTo);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(
      "Se o email estiver cadastrado, enviaremos um link para redefinir sua senha.",
    );
  };

  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe seu email para receber o link de redefinicao."
      footer={
        <>
          Lembrou da senha?{" "}
          <a href="/users/login" className="font-semibold text-[var(--gold-tone-dark)]">
            Voltar ao login
          </a>
        </>
      }
    >
      <form
        className="mt-6 space-y-4 text-left font-[var(--font-nunito-sans)]"
        onSubmit={handleSubmit}
      >
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

        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : success ? (
          <p className="text-sm text-emerald-300">{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.4rem] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70 font-[var(--font-nunito-sans)]"
        >
          {isSubmitting ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </AuthCard>
  );
}

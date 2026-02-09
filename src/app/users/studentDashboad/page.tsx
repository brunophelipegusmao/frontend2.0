"use client";

import Link from "next/link";

export default function StudentDashboardPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_16px_40px_-20px_var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35rem] text-[var(--muted-foreground)]">
            Area do aluno
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Dashboard do estudante
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Este painel esta reservado para as regras especificas do perfil
            STUDENT.
          </p>
        </header>

        <div className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Enquanto voce define as regras de renderizacao por perfil, este
            espaco permanece separado do painel administrativo.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)]"
          >
            Ir para dashboard geral
          </Link>
        </div>
      </div>
    </section>
  );
}

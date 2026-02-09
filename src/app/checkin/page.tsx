"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, UserCheck } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { startSocialSignIn } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function CheckinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Pronto para registrar o próximo check-in.",
  );
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [autoCheckinDone, setAutoCheckinDone] = useState(false);
  const [checkinFeedback, setCheckinFeedback] = useState<{
    open: boolean;
    status: "success" | "error";
    title: string;
    message: string;
  }>({
    open: false,
    status: "success",
    title: "",
    message: "",
  });
  const [checkinFeedbackTimer, setCheckinFeedbackTimer] =
    useState<NodeJS.Timeout | null>(null);

  const showCheckinFeedback = (
    status: "success" | "error",
    title: string,
    message: string,
  ) => {
    if (checkinFeedbackTimer) {
      clearTimeout(checkinFeedbackTimer);
    }
    setCheckinFeedback({ open: true, status, title, message });
    setCheckinFeedbackTimer(
      setTimeout(() => {
        setCheckinFeedback((prev) => ({ ...prev, open: false }));
      }, 5000),
    );
  };

  const parseApiError = async (response: Response, fallback: string) => {
    try {
      const data = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };
      if (Array.isArray(data?.message)) {
        return data.message.join(", ");
      }
      return data?.message || data?.error || fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    return () => {
      if (checkinFeedbackTimer) {
        clearTimeout(checkinFeedbackTimer);
      }
    };
  }, [checkinFeedbackTimer]);

  const handleCheckin = async () => {
    if (!searchTerm.trim()) {
      setStatusMessage("Informe CPF, e-mail ou código do aluno.");
      return;
    }
    setIsCheckingIn(true);
    try {
      const identifier = searchTerm.trim();
      const payload =
        identifier.includes("@")
          ? { email: identifier }
          : { cpf: identifier };

      const response = await fetch(`${API_BASE_URL}/checkin/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel registrar o check-in.",
          ),
        );
      }

      setStatusMessage(`Check-in registrado para ${identifier}.`);
      showCheckinFeedback(
        "success",
        "Check-in realizado",
        "Check-in feito com sucesso. Vejo você suado 💪",
      );
      setSearchTerm("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao registrar o check-in.";
      setStatusMessage(message);
      showCheckinFeedback(
        "error",
        "Erro no check-in",
        `${message}. Direcione-se a um funcionário (staff).`,
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleGoogleCheckin = async () => {
    if (isGoogleLoading) {
      return;
    }
    setIsGoogleLoading(true);
    setStatusMessage("Check-in com Google iniciado. Conclua a autenticação.");
    const origin = window.location.origin;
    const callbackURL = `${origin}/checkin?autoCheckin=1`;
    const completeProfileUrl = new URL("/complete-profile", origin);

    const result = await startSocialSignIn("google", {
      callbackURL,
      newUserCallbackURL: completeProfileUrl.toString(),
    });

    if (!result.ok) {
      setStatusMessage(result.error || "Nao foi possivel iniciar o Google.");
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const shouldAutoCheckin = searchParams.get("autoCheckin") === "1";
    if (!shouldAutoCheckin || autoCheckinDone) {
      return;
    }
    let active = true;
    setAutoCheckinDone(true);
    const run = async () => {
      try {
        setStatusMessage("Confirmando check-in com Google...");
        const response = await fetch(`${API_BASE_URL}/checkin/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response,
              "Nao foi possivel concluir o check-in.",
            ),
          );
        }
        if (!active) {
          return;
        }
        setStatusMessage("Check-in confirmado com Google.");
        showCheckinFeedback(
          "success",
          "Check-in realizado",
          "Check-in feito com sucesso. Vejo você suado 💪",
        );
      } catch (err) {
        if (!active) {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : "Falha ao confirmar check-in.";
        setStatusMessage(message);
        showCheckinFeedback(
          "error",
          "Erro no check-in",
          `${message}. Direcione-se a um funcionário (staff).`,
        );
      } finally {
        if (active) {
          setIsGoogleLoading(false);
          router.replace("/checkin");
        }
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [autoCheckinDone, router, searchParams]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-8 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_16px_40px_-20px_var(--shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_var(--shadow)]">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35rem] text-[var(--muted-foreground)]">
            <UserCheck className="h-4 w-4 text-[var(--gold-tone-dark)]" />
            Check-in
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            Controle de presença em tempo real
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Registre entradas rapidamente e acompanhe o fluxo do dia sem sair do
            painel.
          </p>
        </header>

        <div className="grid gap-6">
          <div className="flex flex-col gap-6 rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_16px_40px_-20px_var(--shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_var(--shadow)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--muted-foreground)]">
                  Check-in rápido
                </p>
                <h2 className="text-lg font-semibold">Identificação</h2>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-col gap-3">
                <GoogleLoginButton
                  label={
                    isGoogleLoading ? "Conectando..." : "Check-in com Google"
                  }
                  onClick={handleGoogleCheckin}
                  className="h-12 rounded-2xl text-xs uppercase tracking-[0.2rem] text-[var(--muted-foreground)] transition-all duration-300 hover:-translate-y-0.5"
                />
                <div className="flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.3rem] text-[var(--muted-foreground)]">
                  <span className="h-px flex-1 bg-[color:var(--border-dim)]" />
                  ou
                  <span className="h-px flex-1 bg-[color:var(--border-dim)]" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  CPF, e-mail ou código do aluno
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Ex: 12345678900 ou maria@email.com"
                    className="h-12 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all duration-300 focus:border-[var(--gold-tone-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--border-glow)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleCheckin}
                  disabled={isCheckingIn}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-6 text-sm font-semibold text-[var(--background)] shadow-[0_12px_28px_-16px_var(--gold-tone)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isCheckingIn ? "Fazendo check-in..." : "Fazer check-in"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--foreground)]">
              {statusMessage}
            </div>

          </div>
        </div>
      </div>
      {checkinFeedback.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 text-[var(--foreground)] shadow-[0_24px_60px_-24px_var(--shadow)] transition-all duration-300">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  checkinFeedback.status === "success"
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-red-400/40 bg-red-500/15 text-red-300"
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{checkinFeedback.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Esta mensagem fecha automaticamente em 5 segundos.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4 text-sm text-[var(--foreground)]">
              {checkinFeedback.message}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Sparkles, UserCheck } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { startSocialSignIn } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const CHECKIN_SUCCESS_MESSAGE =
  "Seu checkin foi realizado com sucesso, vejo você suado!!! 💪🏻";

type ParsedApiError = {
  message: string;
  code?: string;
};

const normalizeErrorText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isDuplicateCheckinError = (message: string, code?: string) => {
  if (code === "CHECKIN_ALREADY_DONE_TODAY") {
    return true;
  }
  const normalized = normalizeErrorText(message);
  return (
    normalized.includes("check-in ja registrado neste dia") ||
    normalized.includes("checkin ja registrado neste dia") ||
    normalized.includes("check-in ja realizado")
  );
};

const isBillingError = (message: string, code?: string) => {
  if (code === "BILLING_OVERDUE_BUSINESS_DAYS") {
    return true;
  }
  const normalized = normalizeErrorText(message);
  return (
    normalized.includes("mensalidade") ||
    normalized.includes("assinatura") ||
    normalized.includes("pagamento") ||
    normalized.includes("plano free")
  );
};

const buildCheckinErrorFeedback = (message: string, code?: string) => {
  if (isDuplicateCheckinError(message, code)) {
    const duplicateMessage = "Check-in já realizado hoje para este usuário.";
    return {
      statusMessage: duplicateMessage,
      feedbackMessage: duplicateMessage,
    };
  }
  if (isBillingError(message, code)) {
    return {
      statusMessage: message,
      feedbackMessage: `${message}. Direcione-se a um funcionário (staff).`,
    };
  }
  return {
    statusMessage: message,
    feedbackMessage: `${message}. Direcione-se a um funcionário (staff).`,
  };
};

function CheckinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Pronto para registrar o próximo check-in.",
  );
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [autoCheckinDone, setAutoCheckinDone] = useState(false);
  const autoCheckinRef = useRef(false);
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

  const closeCheckinFeedback = () => {
    if (checkinFeedbackTimer) {
      clearTimeout(checkinFeedbackTimer);
      setCheckinFeedbackTimer(null);
    }
    setCheckinFeedback((prev) => ({ ...prev, open: false }));
  };

  const parseApiError = async (
    response: Response,
    fallback: string,
  ): Promise<ParsedApiError> => {
    try {
      const data = (await response.json()) as {
        message?: unknown;
        error?: string;
        code?: string;
      };
      if (Array.isArray(data?.message)) {
        return { message: data.message.join(", "), code: data.code };
      }
      if (typeof data?.message === "string") {
        return { message: data.message, code: data.code };
      }
      if (data?.message && typeof data.message === "object") {
        const nested = data.message as { message?: unknown; code?: unknown };
        if (typeof nested.message === "string") {
          return {
            message: nested.message,
            code:
              typeof nested.code === "string"
                ? nested.code
                : typeof data.code === "string"
                  ? data.code
                  : undefined,
          };
        }
      }
      if (typeof data?.error === "string" && data.error.trim()) {
        return { message: data.error, code: data.code };
      }
      return { message: fallback, code: data.code };
    } catch {
      return { message: fallback };
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
        throw await parseApiError(
          response,
          "Nao foi possivel registrar o check-in.",
        );
      }

      setStatusMessage(`Check-in registrado para ${identifier}.`);
      showCheckinFeedback(
        "success",
        "Check-in realizado",
        CHECKIN_SUCCESS_MESSAGE,
      );
      setSearchTerm("");
    } catch (err) {
      const fallbackMessage = "Falha ao registrar o check-in.";
      const parsedError =
        err && typeof err === "object" && "message" in err
          ? (err as ParsedApiError)
          : { message: fallbackMessage };
      const details = buildCheckinErrorFeedback(
        parsedError.message || fallbackMessage,
        parsedError.code,
      );
      setStatusMessage(details.statusMessage);
      showCheckinFeedback(
        "error",
        "Erro no check-in",
        details.feedbackMessage,
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
    const errorCallbackURL = `${origin}/checkin?autoCheckin=error`;
    const completeProfileUrl = new URL("/complete-profile", origin);

    const result = await startSocialSignIn("google", {
      callbackURL,
      errorCallbackURL,
      newUserCallbackURL: completeProfileUrl.toString(),
    });

    if (!result.ok) {
      setStatusMessage(result.error || "Nao foi possivel iniciar o Google.");
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const shouldAutoCheckin = searchParams.get("autoCheckin") === "1";
    const shouldShowError = searchParams.get("autoCheckin") === "error";
    if (shouldShowError && !autoCheckinDone) {
      setAutoCheckinDone(true);
      setIsGoogleLoading(false);
      const message =
        "Conta do Google nao autorizada. Use CPF/e-mail ou fale com um administrador.";
      setStatusMessage(message);
      showCheckinFeedback(
        "error",
        "Erro no check-in",
        `${message}. Direcione-se a um funcionário (staff).`,
      );
      router.replace("/checkin");
      return;
    }
    if (!shouldAutoCheckin || autoCheckinDone) {
      return;
    }
    if (autoCheckinRef.current) {
      return;
    }
    autoCheckinRef.current = true;
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
          throw await parseApiError(
            response,
            "Nao foi possivel concluir o check-in.",
          );
        }
        setStatusMessage("Check-in confirmado com Google.");
        showCheckinFeedback(
          "success",
          "Check-in realizado",
          CHECKIN_SUCCESS_MESSAGE,
        );
      } catch (err) {
        const fallbackMessage = "Falha ao confirmar check-in.";
        const parsedError =
          err && typeof err === "object" && "message" in err
            ? (err as ParsedApiError)
            : { message: fallbackMessage };
        const details = buildCheckinErrorFeedback(
          parsedError.message || fallbackMessage,
          parsedError.code,
        );
        setStatusMessage(details.statusMessage);
        showCheckinFeedback(
          "error",
          "Erro no check-in",
          details.feedbackMessage,
        );
      } finally {
        setIsGoogleLoading(false);
        router.replace("/checkin");
      }
    };
    run();
    return;
  }, [autoCheckinDone, router, searchParams]);

  return (
    <section className="min-h-[100dvh] bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-6 text-[var(--foreground)] sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_16px_40px_-20px_var(--shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_var(--shadow)] sm:p-6">
          <div className="flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2rem] text-[var(--muted-foreground)] sm:text-xs sm:tracking-[0.35rem]">
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
          <div className="flex flex-col gap-6 rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_16px_40px_-20px_var(--shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_var(--shadow)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2rem] text-[var(--muted-foreground)] sm:text-xs sm:tracking-[0.3rem]">
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
                <div className="flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2rem] text-[var(--muted-foreground)] sm:text-[0.65rem] sm:tracking-[0.3rem]">
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
        <div className="checkin-feedback-backdrop fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            className={`checkin-feedback-modal relative w-full max-w-md overflow-hidden rounded-3xl border bg-[color:var(--card)] p-5 text-[var(--foreground)] shadow-[0_30px_90px_-35px_var(--shadow)] sm:p-6 ${
              checkinFeedback.status === "success"
                ? "border-emerald-400/35"
                : "border-red-400/35"
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl ${
                checkinFeedback.status === "success"
                  ? "bg-emerald-400/25"
                  : "bg-red-400/20"
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full blur-2xl ${
                checkinFeedback.status === "success"
                  ? "bg-[var(--gold-tone)]/15"
                  : "bg-red-500/10"
              }`}
            />

            <div className="relative flex items-center justify-between gap-3">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16rem] sm:text-[0.62rem] sm:tracking-[0.22rem] ${
                  checkinFeedback.status === "success"
                    ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                    : "border-red-400/30 bg-red-500/15 text-red-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Aviso
              </div>
              <button
                type="button"
                onClick={closeCheckinFeedback}
                className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Fechar
              </button>
            </div>

            <div className="relative mt-5 flex items-center gap-3">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                  checkinFeedback.status === "success"
                    ? "checkin-feedback-icon--success border-emerald-400/45 bg-emerald-500/20 text-emerald-200"
                    : "border-red-400/45 bg-red-500/20 text-red-200"
                }`}
              >
                {checkinFeedback.status === "success" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </span>
              <div>
                <p className="text-base font-semibold">{checkinFeedback.title}</p>
                <p className="text-xs tracking-[0.05em] text-[var(--muted-foreground)]">
                  Esta mensagem fecha automaticamente em 5 segundos.
                </p>
              </div>
            </div>

            <div
              className={`relative mt-4 rounded-2xl border p-4 text-sm leading-relaxed ${
                checkinFeedback.status === "success"
                  ? "border-emerald-400/25 bg-emerald-500/10"
                  : "border-red-400/25 bg-red-500/10"
              }`}
            >
              {checkinFeedback.message}
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--border-dim)]">
              <span
                aria-hidden="true"
                className={`checkin-feedback-progress block h-full rounded-full ${
                  checkinFeedback.status === "success"
                    ? "bg-gradient-to-r from-emerald-300 to-[var(--gold-tone)]"
                    : "bg-gradient-to-r from-red-300 to-red-500"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-[100dvh] bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] px-4 py-6 text-[var(--foreground)] sm:px-8 sm:py-8">
          <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
            Carregando check-in...
          </div>
        </section>
      }
    >
      <CheckinPageContent />
    </Suspense>
  );
}

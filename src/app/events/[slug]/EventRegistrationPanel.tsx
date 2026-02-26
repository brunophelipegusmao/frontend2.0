"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isValidCpf, normalizeCpf } from "@/lib/cpf";

type EventRegistrationPanelProps = {
  slug: string;
  eventPath?: string;
  accessMode: "open" | "registered_only";
  capacity?: number | null;
  confirmedRegistrations?: number;
  allowGuests?: boolean;
  isCancelled?: boolean;
};

type RegistrationResponse = {
  status?: "pending" | "confirmed" | "waitlisted";
};

type GuestForm = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:3001";

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const parseApiError = async (response: Response, fallback: string) => {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message[0];
    }
    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
    return fallback;
  } catch {
    return fallback;
  }
};

export function EventRegistrationPanel({
  slug,
  eventPath,
  accessMode,
  capacity = null,
  confirmedRegistrations = 0,
  allowGuests = true,
  isCancelled = false,
}: EventRegistrationPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChoosingProfile, setIsChoosingProfile] = useState(false);
  const [guestStep, setGuestStep] = useState<"hidden" | "form" | "confirm">(
    "hidden",
  );
  const [guestForm, setGuestForm] = useState<GuestForm>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [guestFormError, setGuestFormError] = useState<string | null>(null);
  const isAtCapacity =
    capacity !== null && Number(confirmedRegistrations) >= capacity;

  const normalizePhone = (value: string) => value.trim();

  const parseRegistrationStatus = (
    status: string | null,
    message: string | null,
  ) => {
    if (!status) {
      return null;
    }
    if (status === "confirmed") {
      return {
        tone: "success" as const,
        message: message || "Inscricao confirmada com sucesso.",
      };
    }
    if (status === "pending") {
      return {
        tone: "success" as const,
        message: message || "Inscricao realizada. Aguardando confirmacao.",
      };
    }
    if (status === "waitlisted") {
      return {
        tone: "info" as const,
        message: message || "Inscricao realizada. Voce entrou na lista de espera.",
      };
    }
    if (status === "already") {
      return {
        tone: "info" as const,
        message: message || "Voce ja esta inscrito neste evento.",
      };
    }
    return {
      tone: "error" as const,
      message: message || "Nao foi possivel concluir a inscricao.",
    };
  };

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const response = await fetch(buildApiUrl("/users/me/status"), {
          credentials: "include",
        });
        if (!active) {
          return;
        }
        setIsLoggedIn(response.ok);
      } catch {
        if (active) {
          setIsLoggedIn(false);
        }
      }
    };

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const status = searchParams.get("registrationStatus");
    const message = searchParams.get("registrationMessage");
    const parsedFeedback = parseRegistrationStatus(status, message);
    if (!parsedFeedback) {
      return;
    }

    setFeedback(parsedFeedback);
    const cleaned = new URLSearchParams(searchParams.toString());
    cleaned.delete("registrationStatus");
    cleaned.delete("registrationMessage");
    const nextPath = cleaned.toString()
      ? `${pathname}?${cleaned.toString()}`
      : pathname;
    router.replace(nextPath, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleGuestContinue = () => {
    setGuestFormError(null);
    const email = guestForm.email.trim().toLowerCase();
    const cpf = normalizeCpf(guestForm.cpf);
    const phone = normalizePhone(guestForm.phone);
    const name = guestForm.name.trim();

    if (!email || !email.includes("@")) {
      setGuestFormError("Informe um e-mail valido.");
      return;
    }
    if (cpf.length !== 11) {
      setGuestFormError("CPF deve conter 11 digitos.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setGuestFormError("CPF invalido.");
      return;
    }
    if (phone.length < 8) {
      setGuestFormError("Informe um telefone valido.");
      return;
    }
    if (name && name.length < 2) {
      setGuestFormError("Nome deve ter pelo menos 2 caracteres.");
      return;
    }

    setGuestStep("confirm");
  };

  const handleStudentChoice = () => {
    const targetEventPath = eventPath || `/events/event-${slug}`;
    const loginUrl = `/users/login?registerAfterLogin=1&eventSlug=${encodeURIComponent(
      slug,
    )}&eventPath=${encodeURIComponent(targetEventPath)}`;
    router.push(loginUrl);
  };

  const handleGuestConfirmRegistration = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setGuestFormError(null);

    const payload = {
      name: guestForm.name.trim() || undefined,
      email: guestForm.email.trim().toLowerCase(),
      cpf: normalizeCpf(guestForm.cpf),
      phone: normalizePhone(guestForm.phone),
    };

    try {
      const response = await fetch(
        buildApiUrl(`/events/public/${encodeURIComponent(slug)}/register-guest`),
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        if (response.status === 409) {
          const message = await parseApiError(
            response,
            "Nao foi possivel concluir a inscricao.",
          );
          const duplicateRegistration =
            /ja esta inscrito/i.test(message) ||
            /inscricao ja existente/i.test(message);
          setFeedback({
            tone: duplicateRegistration ? "info" : "error",
            message,
          });
          setGuestStep("hidden");
          return;
        }
        const message = await parseApiError(
          response,
          "Nao foi possivel concluir a inscricao de convidado.",
        );
        setFeedback({ tone: "error", message });
        return;
      }

      const registration = (await response.json()) as RegistrationResponse;
      if (registration.status === "pending") {
        setFeedback({
          tone: "success",
          message: "Inscricao realizada. Aguardando confirmacao.",
        });
      } else if (registration.status === "waitlisted") {
        setFeedback({
          tone: "info",
          message: "Inscricao realizada. Voce entrou na lista de espera.",
        });
      } else {
        setFeedback({
          tone: "success",
          message: "Inscricao confirmada com sucesso.",
        });
      }

      setGuestStep("hidden");
      setIsChoosingProfile(false);
      setGuestForm({
        name: "",
        email: "",
        cpf: "",
        phone: "",
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "Falha ao comunicar com o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (isSubmitting) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        buildApiUrl(`/events/public/${encodeURIComponent(slug)}/register`),
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
            "Nao foi possivel concluir a inscricao.",
          );
          const duplicateRegistration =
            /ja esta inscrito/i.test(message) ||
            /inscricao ja existente/i.test(message);
          setFeedback({
            tone: duplicateRegistration ? "info" : "error",
            message,
          });
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setIsLoggedIn(false);
          setFeedback({
            tone: "error",
            message: "Sessao expirada. Entre novamente para se inscrever.",
          });
          return;
        }

        const message = await parseApiError(
          response,
          "Nao foi possivel concluir a inscricao.",
        );
        setFeedback({ tone: "error", message });
        return;
      }

      const payload = (await response.json()) as RegistrationResponse;
      const status = payload?.status ?? "confirmed";

      if (status === "pending") {
        setFeedback({
          tone: "success",
          message: "Inscricao realizada. Aguardando confirmacao.",
        });
        return;
      }

      if (status === "waitlisted") {
        setFeedback({
          tone: "info",
          message: "Inscricao realizada. Voce entrou na lista de espera.",
        });
        return;
      }

      setFeedback({
        tone: "success",
        message: "Inscricao confirmada com sucesso.",
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "Falha ao comunicar com o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCancelled) {
    return (
      <section className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
        Este evento esta cancelado e nao aceita novas inscricoes.
      </section>
    );
  }

  if (accessMode === "open") {
    return (
      <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
        Evento aberto: inscricao previa nao e obrigatoria.
      </section>
    );
  }

  if (isAtCapacity) {
    return (
      <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
        Evento lotado. O limite de inscricoes confirmadas foi atingido.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
        Inscricao
      </h2>

      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Para participar deste evento, confirme sua inscricao abaixo.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleRegister}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Enviando..." : "Confirmar inscricao"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsChoosingProfile(true);
              setGuestStep("hidden");
              setGuestFormError(null);
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)]"
          >
            Entrar para se inscrever
          </button>
        )}
      </div>

      {guestStep === "form" && (
        <div className="mt-4 space-y-3 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22rem] text-[var(--gold-tone-dark)]">
            Cadastro de convidado
          </p>
          <label className="block text-sm text-[var(--foreground)]">
            Nome (opcional)
            <input
              value={guestForm.name}
              onChange={(event) =>
                setGuestForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 text-sm text-[var(--foreground)]"
            />
          </label>
          <label className="block text-sm text-[var(--foreground)]">
            E-mail
            <input
              type="email"
              value={guestForm.email}
              onChange={(event) =>
                setGuestForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 text-sm text-[var(--foreground)]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-[var(--foreground)]">
              CPF
              <input
                value={guestForm.cpf}
                onChange={(event) =>
                  setGuestForm((prev) => ({
                    ...prev,
                    cpf: normalizeCpf(event.target.value).slice(0, 11),
                  }))
                }
                inputMode="numeric"
                maxLength={11}
                className="mt-1 h-10 w-full rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="block text-sm text-[var(--foreground)]">
              Telefone
              <input
                value={guestForm.phone}
                onChange={(event) =>
                  setGuestForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 text-sm text-[var(--foreground)]"
              />
            </label>
          </div>
          {guestFormError && (
            <p className="text-sm text-[color:var(--danger)]">{guestFormError}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs font-semibold uppercase tracking-[0.2rem] text-[var(--background)]"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={() => {
                setGuestStep("hidden");
                setGuestFormError(null);
              }}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.14rem] text-[var(--foreground)] sm:tracking-[0.2rem]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {guestStep === "confirm" && (
        <div className="mt-4 space-y-3 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4">
          <p className="text-sm text-[var(--foreground)]">
            Confirmar inscricao como convidado neste evento?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleGuestConfirmRegistration}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs font-semibold uppercase tracking-[0.14rem] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60 sm:tracking-[0.2rem]"
            >
              {isSubmitting ? "Confirmando..." : "Confirmar inscricao"}
            </button>
            <button
              type="button"
              onClick={() => setGuestStep("form")}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.14rem] text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60 sm:tracking-[0.2rem]"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p
          className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : feedback.tone === "info"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                : "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {isChoosingProfile && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 shadow-[0_24px_60px_-24px_var(--shadow)] sm:p-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.3rem]">
              Tipo de inscricao
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              Voce e aluno ou convidado?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Escolha uma opcao para continuar a inscricao no evento.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStudentChoice}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)]"
              >
                Sou aluno
              </button>
              {allowGuests ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsChoosingProfile(false);
                    setGuestStep("form");
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                >
                  Sou convidado
                </button>
              ) : (
                <p className="rounded-xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-2 text-sm text-[color:var(--danger)]">
                  Este evento e exclusivo para alunos.
                </p>
              )}
              <button
                type="button"
                onClick={() => setIsChoosingProfile(false)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-5 text-xs font-semibold uppercase tracking-[0.14rem] text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] sm:tracking-[0.2rem]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

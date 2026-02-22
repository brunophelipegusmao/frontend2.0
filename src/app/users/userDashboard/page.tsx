"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { isHiddenPlanSlug } from "@/lib/plans";
import { API_BASE_URL } from "@/lib/roleRedirect";

type DashboardUser = {
  id: string;
  email: string;
  cpf: string | null;
  name: string | null;
  image: string | null;
  avatarUrl: string | null;
  phone: string | null;
  address: string | null;
  role: "MASTER" | "ADMIN" | "STAFF" | "COACH" | "STUDENT" | "GUEST";
  planId: string;
  planName: string | null;
  planSlug: string | null;
};

type UserStatus = {
  cpfFilled: boolean;
  nameFilled: boolean;
  phoneFilled: boolean;
  healthFilled: boolean;
  hasPassword: boolean;
};

type HealthProfile = {
  birthDate?: string | null;
};

type Plan = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  promoActive: boolean;
  promoPriceCents: number | null;
};

type CheckinItem = {
  id: number;
  checkedInAt: string;
  createdAt: string;
};

type RegistrationStatus = "confirmed" | "pending" | "waitlisted" | "cancelled";

type MyEventRegistration = {
  registrationId: string;
  registrationStatus: RegistrationStatus;
  registrationCreatedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  endTime: string | null;
  location: string | null;
  thumbnailUrl: string | null;
  status: "draft" | "published" | "cancelled";
  isPublished: boolean;
  accessMode: "open" | "registered_only";
  capacity: number | null;
  allowGuests: boolean;
  requiresConfirmation: boolean;
  isPaid: boolean;
  priceCents: number | null;
  confirmedRegistrations: number;
  path: string;
};

type PublicEventCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  time: string;
  endTime: string | null;
  location: string | null;
  thumbnailUrl: string | null;
  status?: "draft" | "published" | "cancelled";
  accessMode: "open" | "registered_only";
  capacity: number | null;
  confirmedRegistrations: number;
  isPaid: boolean;
  priceCents: number | null;
  path: string;
};

type FeedbackTone = "success" | "error" | "info";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseApiError = async (response: Response, fallback: string) => {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message[0] ?? fallback;
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

const parseDate = (value: string) => {
  const directMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!directMatch) {
    return new Date(value);
  }
  return new Date(
    Number(directMatch[1]),
    Number(directMatch[2]) - 1,
    Number(directMatch[3]),
  );
};

const formatDate = (value: string) => {
  const parsed = parseDate(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return dateFormatter.format(parsed);
};

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(parsed);
};

const formatEventTime = (time: string, endTime: string | null) =>
  endTime ? `${time} - ${endTime}` : time;

const formatEventPrice = (event: { isPaid: boolean; priceCents: number | null }) => {
  if (!event.isPaid) {
    return "Gratuito";
  }
  if (event.priceCents && event.priceCents > 0) {
    return currencyFormatter.format(event.priceCents / 100);
  }
  return "Pago";
};

const statusLabelMap: Record<RegistrationStatus, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  waitlisted: "Lista de espera",
  cancelled: "Cancelada",
};

const statusClassMap: Record<RegistrationStatus, string> = {
  confirmed:
    "border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success)]",
  pending: "border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--gold-tone-dark)]",
  waitlisted:
    "border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--gold-tone-dark)]",
  cancelled:
    "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]",
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: FeedbackTone;
    message: string;
  } | null>(null);

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [healthBirthDate, setHealthBirthDate] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [myEvents, setMyEvents] = useState<MyEventRegistration[]>([]);
  const [availableEvents, setAvailableEvents] = useState<PublicEventCard[]>([]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [planForm, setPlanForm] = useState({
    targetPlanId: "",
    notes: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingPlanRequest, setSendingPlanRequest] = useState(false);
  const [isMasterPreview, setIsMasterPreview] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadData = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setPageError(null);

      try {
        const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (meResponse.status === 401 || meResponse.status === 403) {
          router.replace("/users/login");
          return;
        }
        if (!meResponse.ok) {
          throw new Error(await parseApiError(meResponse, "Falha ao carregar usuario."));
        }

        const me = (await meResponse.json()) as DashboardUser;
        const previewParam =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("preview")
            : null;
        const isPreviewRequested = previewParam?.toLowerCase() === "student";
        const isAllowedMasterPreview = me.role === "MASTER" && isPreviewRequested;

        if (me.role !== "STUDENT" && !isAllowedMasterPreview) {
          router.replace("/dashboard");
          return;
        }
        setIsMasterPreview(isAllowedMasterPreview);

        const today = new Date();
        const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(today.getDate()).padStart(2, "0")}`;

        const [
          statusResponse,
          healthResponse,
          plansResponse,
          checkinsResponse,
          myEventsResponse,
          publicEventsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me/status`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/health/me`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/plans`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/checkin/me/history`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/events/me/registrations`, {
            credentials: "include",
            cache: "no-store",
          }),
          fetch(`${API_BASE_URL}/events/public/cards?from=${from}&includeCancelled=1`, {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (
          statusResponse.status === 401 ||
          checkinsResponse.status === 401 ||
          myEventsResponse.status === 401
        ) {
          router.replace("/users/login");
          return;
        }

        const statusPayload = statusResponse.ok
          ? ((await statusResponse.json()) as UserStatus)
          : null;
        const healthPayload = healthResponse.ok
          ? ((await healthResponse.json()) as HealthProfile | null)
          : null;
        const plansPayload = plansResponse.ok
          ? ((await plansResponse.json()) as Plan[])
          : [];
        const checkinsPayload = checkinsResponse.ok
          ? ((await checkinsResponse.json()) as CheckinItem[])
          : [];
        const myEventsPayload = myEventsResponse.ok
          ? ((await myEventsResponse.json()) as MyEventRegistration[])
          : [];
        const publicEventsPayload = publicEventsResponse.ok
          ? ((await publicEventsResponse.json()) as PublicEventCard[])
          : [];

        const registeredEventIds = new Set(myEventsPayload.map((event) => event.id));
        const nextAvailable = publicEventsPayload.filter((event) => {
          if (registeredEventIds.has(event.id)) {
            return false;
          }
          if (event.status === "cancelled") {
            return false;
          }
          return true;
        });

        setUser(me);
        setStatus(statusPayload);
        setHealthBirthDate(healthPayload?.birthDate ?? null);
        setPlans(plansPayload);
        setCheckins(checkinsPayload);
        setMyEvents(myEventsPayload);
        setAvailableEvents(nextAvailable);
        setProfileForm({
          name: me.name ?? "",
          email: me.email ?? "",
          phone: me.phone ?? "",
          address: me.address ?? "",
        });
        setPlanForm((prev) => ({
          ...prev,
          targetPlanId: prev.targetPlanId || me.planId || "",
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Falha ao carregar dashboard.";
        setPageError(message);
      } finally {
        if (mode === "initial") {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    void loadData("initial");
  }, [loadData]);

  const planOptions = useMemo(() => {
    const blockedSlugs = new Set(["guest"]);
    return plans.filter((plan) => {
      const normalizedSlug = plan.slug.trim().toLowerCase();
      if (blockedSlugs.has(normalizedSlug)) {
        return false;
      }
      return !isHiddenPlanSlug(normalizedSlug);
    });
  }, [plans]);

  const handleProfileChange = (
    field: "name" | "email" | "phone" | "address",
    value: string,
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim().toLowerCase();
    const trimmedPhone = profileForm.phone.trim();
    const trimmedAddress = profileForm.address.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFeedback({
        tone: "error",
        message: "Informe um nome valido.",
      });
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setFeedback({
        tone: "error",
        message: "Informe um e-mail valido.",
      });
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 8) {
      setFeedback({
        tone: "error",
        message: "Informe um telefone valido.",
      });
      return;
    }

    setSavingProfile(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          address: trimmedAddress,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/users/login");
        return;
      }
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Nao foi possivel salvar o perfil."));
      }

      const updatedUser = (await response.json()) as DashboardUser;
      setUser(updatedUser);
      setProfileForm({
        name: updatedUser.name ?? "",
        email: updatedUser.email ?? "",
        phone: updatedUser.phone ?? "",
        address: updatedUser.address ?? "",
      });
      setFeedback({
        tone: "success",
        message: "Dados pessoais atualizados com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel salvar o perfil.";
      setFeedback({ tone: "error", message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingAvatar(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/users/login");
        return;
      }
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Falha ao enviar avatar."));
      }

      const avatar = (await response.json()) as {
        avatarUrl?: string | null;
        image?: string | null;
      };

      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatarUrl: avatar.avatarUrl ?? prev.avatarUrl,
              image: avatar.image ?? avatar.avatarUrl ?? prev.image,
            }
          : prev,
      );
      setFeedback({
        tone: "success",
        message: "Foto atualizada com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar foto.";
      setFeedback({ tone: "error", message });
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleSavePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (newPassword.length < 6) {
      setFeedback({
        tone: "error",
        message: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({
        tone: "error",
        message: "A confirmacao de senha nao confere.",
      });
      return;
    }

    setSavingPassword(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/users/login");
        return;
      }
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Nao foi possivel alterar a senha."));
      }

      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setFeedback({
        tone: "success",
        message: "Senha atualizada com sucesso.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel alterar a senha.";
      setFeedback({ tone: "error", message });
    } finally {
      setSavingPassword(false);
    }
  };

  const requestPlan = async (type: "plan_change" | "plan_activation") => {
    if (!user) {
      return;
    }

    if (type === "plan_change" && !planForm.targetPlanId) {
      setFeedback({
        tone: "error",
        message: "Selecione o plano desejado para solicitar a troca.",
      });
      return;
    }

    setSendingPlanRequest(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/plan-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          targetPlanId: planForm.targetPlanId || undefined,
          notes: planForm.notes.trim() || undefined,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        router.replace("/users/login");
        return;
      }
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel enviar a solicitacao."),
        );
      }

      await response.json();
      setFeedback({
        tone: "success",
        message:
          type === "plan_change"
            ? "Solicitacao de troca de plano enviada para analise."
            : "Solicitacao de ativacao enviada para analise.",
      });
      setPlanForm((prev) => ({ ...prev, notes: "" }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Nao foi possivel enviar a solicitacao.";
      setFeedback({ tone: "error", message });
    } finally {
      setSendingPlanRequest(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    setFeedback(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Nao foi possivel sair."));
      }
      router.replace("/users/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao sair da conta.";
      setFeedback({ tone: "error", message });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Carregando dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 text-[var(--foreground)]">
      <header className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_16px_40px_-20px_var(--shadow)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--gold-tone-dark)]">
              Area do aluno
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              {isMasterPreview ? "Preview do dashboard do aluno" : "Meu dashboard"}
            </h1>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {isMasterPreview
                ? "Visualizacao MASTER do painel de aluno para validar experiencia e regras."
                : "Aqui voce gerencia seus dados pessoais, plano, historico de check-ins e participacao em eventos."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadData("refresh")}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.22rem] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Atualizando..." : "Atualizar"}
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.22rem] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      {isMasterPreview ? (
        <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
          Modo preview ativo para MASTER. Esta tela usa os seus proprios dados da conta
          autenticada.
        </section>
      ) : null}

      {pageError ? (
        <section className="rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]">
          {pageError}
        </section>
      ) : null}

      {feedback ? (
        <section
          className={`rounded-2xl border p-4 text-sm ${
            feedback.tone === "success"
              ? "border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success)]"
              : feedback.tone === "info"
                ? "border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--gold-tone-dark)]"
                : "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
          }`}
        >
          {feedback.message}
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
            Dados pessoais
          </h2>
          <form className="mt-4 space-y-4" onSubmit={handleSaveProfile}>
            <div className="flex flex-wrap items-center gap-3">
              <Image
                src={user?.avatarUrl || user?.image || "/images/icon-wt.png"}
                alt="Avatar do usuario"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-[color:var(--border-dim)] object-cover"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--border-dim)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2rem] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]">
                {uploadingAvatar ? "Enviando..." : "Trocar foto"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleAvatarChange(event)}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Nome
                <input
                  value={profileForm.name}
                  onChange={(event) => handleProfileChange("name", event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
                />
              </label>
              <label className="text-sm">
                E-mail
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(event) => handleProfileChange("email", event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
                />
              </label>
              <label className="text-sm">
                Telefone
                <input
                  value={profileForm.phone}
                  onChange={(event) => handleProfileChange("phone", event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
                />
              </label>
              <label className="text-sm">
                CPF (nao editavel)
                <input
                  value={user?.cpf ?? ""}
                  disabled
                  className="mt-1 h-11 w-full cursor-not-allowed rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm opacity-70"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Endereco
                <input
                  value={profileForm.address}
                  onChange={(event) => handleProfileChange("address", event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? "Salvando..." : "Salvar dados"}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
            Perfil atual
          </h2>
          <div className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">Plano:</span>{" "}
              {user?.planName || "Nao informado"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Slug do plano:</span>{" "}
              {user?.planSlug || "-"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Nascimento (health):</span>{" "}
              {healthBirthDate ? formatDate(healthBirthDate) : "Nao informado"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Status saude:</span>{" "}
              {status?.healthFilled ? "Completo" : "Pendente"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Senha configurada:</span>{" "}
              {status?.hasPassword ? "Sim" : "Nao"}
            </p>
          </div>

          <Link
            href="/complete-profile"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-xs font-semibold uppercase tracking-[0.22rem] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
          >
            Atualizar saude
          </Link>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
            Alterar senha
          </h2>
          <form className="mt-4 space-y-4" onSubmit={handleSavePassword}>
            <label className="block text-sm">
              Nova senha
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
              />
            </label>
            <label className="block text-sm">
              Confirmar nova senha
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? "Salvando..." : "Atualizar senha"}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
            Planos
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Solicite troca de plano ou ativacao para analise da equipe.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              Plano desejado
              <select
                value={planForm.targetPlanId}
                onChange={(event) =>
                  setPlanForm((prev) => ({ ...prev, targetPlanId: event.target.value }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 text-sm"
              >
                <option value="">Selecione um plano</option>
                {planOptions.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan.promoActive && plan.promoPriceCents !== null
                      ? currencyFormatter.format(plan.promoPriceCents / 100)
                      : currencyFormatter.format(plan.priceCents / 100)}
                    )
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Observacoes (opcional)
              <textarea
                value={planForm.notes}
                onChange={(event) =>
                  setPlanForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                rows={3}
                className="mt-1 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void requestPlan("plan_change")}
                disabled={sendingPlanRequest}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs font-semibold uppercase tracking-[0.2rem] text-[var(--background)] transition hover:bg-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Solicitar troca
              </button>
              <button
                type="button"
                onClick={() => void requestPlan("plan_activation")}
                disabled={sendingPlanRequest}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-transparent px-4 text-xs font-semibold uppercase tracking-[0.2rem] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Solicitar ativacao
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
            Historico de check-in
          </h2>
          <div className="mt-4 max-h-96 space-y-2 overflow-auto pr-1">
            {checkins.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Nenhum check-in encontrado.
              </p>
            ) : (
              checkins.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-sm"
                >
                  <p className="font-semibold">Check-in #{item.id}</p>
                  <p className="text-[var(--muted-foreground)]">
                    {formatDateTime(item.checkedInAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
            Eventos inscritos
          </h2>
          <div className="mt-4 max-h-96 space-y-3 overflow-auto pr-1">
            {myEvents.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Voce ainda nao possui inscricoes em eventos.
              </p>
            ) : (
              myEvents.map((event) => (
                <article
                  key={event.registrationId}
                  className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{event.title}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16rem] ${statusClassMap[event.registrationStatus]}`}
                    >
                      {statusLabelMap[event.registrationStatus]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {formatDate(event.date)} • {formatEventTime(event.time, event.endTime)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {formatEventPrice(event)} •{" "}
                    {event.accessMode === "open" ? "Aberto" : "Com inscricao"}
                  </p>
                  <Link
                    href={event.path}
                    className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.18rem] text-[var(--gold-tone-dark)]"
                  >
                    Ver evento
                  </Link>
                </article>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.28rem] text-[var(--gold-tone-dark)]">
          Eventos disponiveis
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {availableEvents.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Nenhum evento disponivel no momento.
            </p>
          ) : (
            availableEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-3"
              >
                <h3 className="text-sm font-semibold">{event.title}</h3>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatDate(event.date)} • {formatEventTime(event.time, event.endTime)}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatEventPrice(event)} •{" "}
                  {event.accessMode === "open" ? "Aberto" : "Com inscricao"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Confirmadas: {Number(event.confirmedRegistrations ?? 0)}
                  {event.capacity !== null ? ` / ${event.capacity}` : ""}
                </p>
                <Link
                  href={event.path || `/events/event-${event.slug}`}
                  className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.18rem] text-[var(--gold-tone-dark)]"
                >
                  Ver evento
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}

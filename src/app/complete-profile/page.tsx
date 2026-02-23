"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { redirectBasedOnRole } from "@/lib/roleRedirect";
import { AuthCard } from "@/components/AuthCard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const parseApiError = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data?.message || data?.error || "Nao foi possivel completar o perfil.";
  } catch {
    return "Nao foi possivel completar o perfil.";
  }
};

const parsePositive = (value: string) => {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const normalizeHeightCm = (value: string) => {
  const parsed = parsePositive(value);
  if (parsed === null) {
    return null;
  }
  if (parsed > 0 && parsed < 3.5) {
    return parsed * 100;
  }
  return parsed;
};

const completeProfile = async (payload: {
  cpf: string;
  name?: string;
  phone?: string;
  address?: string;
  image?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/users/me/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
};

const emptyHealthForm = {
  heightCm: "",
  weightKg: "",
  bloodType: "",
  sex: "",
  birthDate: "",
  injuries: "",
  hasInjuries: false,
  takesMedication: false,
  medications: "",
  exercisesRegularly: false,
  usesSupplementation: false,
  supplements: "",
};

const bloodTypeOptions = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "O_POSITIVE", label: "O+" },
];

const sexOptions = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Feminino" },
];

const labelClassName =
  "space-y-2 text-sm font-medium text-[var(--foreground)]";
const labelHintClassName = "text-xs text-[var(--muted-foreground)]";
const inputBaseClassName =
  "w-full rounded-xl border bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition focus:outline-none focus:ring-2 focus:ring-[var(--border-glow)]";
const inputBorderClassName =
  "border-[color:var(--border-dim)] focus:border-[var(--gold-tone-dark)]";
const inputErrorClassName =
  "border-red-400 focus:border-red-400 focus:ring-red-400/40";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "health">("profile");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [role, setRole] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [healthForm, setHealthForm] = useState({ ...emptyHealthForm });
  const [healthSubmitting, setHealthSubmitting] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthSuccess, setHealthSuccess] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
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
  const [saveFeedbackTimer, setSaveFeedbackTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<
    Partial<Record<"cpf" | "name" | "phone" | "address", string>>
  >({});
  const [healthFieldErrors, setHealthFieldErrors] = useState<
    Partial<
      Record<
        | "heightCm"
        | "weightKg"
        | "bloodType"
        | "sex"
        | "birthDate"
        | "injuries"
        | "medications"
        | "supplements",
        string
      >
    >
  >({});

  useEffect(() => {
    return () => {
      if (saveFeedbackTimer) {
        clearTimeout(saveFeedbackTimer);
      }
    };
  }, [saveFeedbackTimer]);

  const showSaveFeedback = (
    status: "success" | "error",
    title: string,
    message: string,
  ) => {
    if (saveFeedbackTimer) {
      clearTimeout(saveFeedbackTimer);
    }
    setSaveFeedback({ open: true, status, title, message });
    setSaveFeedbackTimer(
      setTimeout(() => {
        setSaveFeedback((prev) => ({ ...prev, open: false }));
      }, 5000),
    );
  };

  const sanitizedCpf = useMemo(() => cpf.replace(/\D/g, ""), [cpf]);

  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      setStatus("loading");
      try {
        const statusResponse = await fetch(`${API_BASE_URL}/users/me/status`, {
          credentials: "include",
        });
        if (!statusResponse.ok) {
          router.replace("/users/login");
          return;
        }
        const statusData = (await statusResponse.json()) as {
          cpfFilled?: boolean;
          healthFilled?: boolean;
        };

        const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: "include",
        });
        const userData = userResponse.ok ? await userResponse.json() : null;
        if (!active) {
          return;
        }
        if (userData) {
          setRole(userData.role ?? null);
          setName(userData.name ?? "");
          setPhone(userData.phone ?? "");
          setAddress(userData.address ?? "");
          setCpf(userData.cpf ?? "");
          const fallbackAvatar = userData.avatarUrl || userData.image || null;
          setExistingAvatarUrl(fallbackAvatar);
        }

        if (statusData.cpfFilled && statusData.healthFilled) {
          await redirectBasedOnRole(router);
          return;
        }

        if (statusData.cpfFilled && !statusData.healthFilled) {
          setStep("health");
        } else {
          setStep("profile");
        }

        if (!statusData.healthFilled) {
          const healthResponse = await fetch(`${API_BASE_URL}/health/me`, {
            credentials: "include",
          });
          if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            if (healthData) {
              const normalizedInjuries =
                healthData.injuries === "Nenhuma"
                  ? ""
                  : (healthData.injuries ?? "");
              setHealthForm({
                heightCm: healthData.heightCm ?? "",
                weightKg: healthData.weightKg ?? "",
                bloodType: healthData.bloodType ?? "",
                sex: healthData.sex ?? "",
                birthDate: healthData.birthDate ?? "",
                injuries: normalizedInjuries,
                hasInjuries:
                  Boolean(normalizedInjuries) &&
                  healthData.injuries !== "Nenhuma",
                takesMedication: healthData.takesMedication ?? false,
                medications: healthData.medications ?? "",
                exercisesRegularly: healthData.exercisesRegularly ?? false,
                usesSupplementation: healthData.usesSupplementation ?? false,
                supplements: healthData.supplements ?? "",
              });
            }
          }
        }

        setStatus("ready");
      } catch {
        if (!active) {
          return;
        }
        setStatus("error");
      }
    };
    loadStatus();
    return () => {
      active = false;
    };
  }, [router]);

  const uploadAvatar = async (file: File) => {
    const payload = new FormData();
    payload.append("file", file);

    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: "POST",
      credentials: "include",
      body: payload,
    });

    if (!response.ok) {
      throw new Error(await parseApiError(response));
    }

    return response.json();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setProfileFieldErrors({});

    const nextErrors: Partial<
      Record<"cpf" | "name" | "phone" | "address", string>
    > = {};
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (sanitizedCpf.length !== 11) {
      nextErrors.cpf = "CPF deve conter 11 digitos numericos.";
    }
    if (!trimmedPhone) {
      nextErrors.phone = "Telefone é obrigatório.";
    }
    if (role !== "GUEST" && !trimmedName) {
      nextErrors.name = "Nome é obrigatório.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setProfileFieldErrors(nextErrors);
      setError("Preencha os campos obrigatórios destacados.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (imageFile) {
        await uploadAvatar(imageFile);
      }
      await completeProfile({
        cpf: sanitizedCpf,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        image:
          imageFile || !existingAvatarUrl
            ? undefined
            : existingAvatarUrl,
      });
      const statusResponse = await fetch(`${API_BASE_URL}/users/me/status`, {
        credentials: "include",
      });
      const statusData = statusResponse.ok
        ? await statusResponse.json()
        : null;
      const needsHealth = statusData && !statusData.healthFilled;
      if (needsHealth && role !== "GUEST") {
        setStep("health");
        setSuccess("Perfil atualizado. Agora finalize os dados de saúde.");
        showSaveFeedback(
          "success",
          "Perfil salvo",
          "Seus dados pessoais foram atualizados.",
        );
      } else {
        setSuccess("Perfil atualizado. Redirecionando...");
        showSaveFeedback(
          "success",
          "Perfil salvo",
          "Seus dados pessoais foram atualizados.",
        );
        await redirectBasedOnRole(router);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Algo inesperado aconteceu.";
      setError(message);
      showSaveFeedback("error", "Erro ao salvar perfil", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateHealth = () => {
    const nextErrors: Partial<
      Record<
        | "heightCm"
        | "weightKg"
        | "bloodType"
        | "sex"
        | "birthDate"
        | "injuries"
        | "medications"
        | "supplements",
        string
      >
    > = {};
    if (!healthForm.heightCm) {
      nextErrors.heightCm = "Altura é obrigatória.";
    } else if (!normalizeHeightCm(healthForm.heightCm)) {
      nextErrors.heightCm = "Altura inválida.";
    }
    if (!healthForm.weightKg) {
      nextErrors.weightKg = "Peso é obrigatório.";
    } else if (!parsePositive(healthForm.weightKg)) {
      nextErrors.weightKg = "Peso inválido.";
    }
    if (!healthForm.bloodType) {
      nextErrors.bloodType = "Tipo sanguíneo é obrigatório.";
    }
    if (!healthForm.sex) {
      nextErrors.sex = "Sexo é obrigatório.";
    }
    if (!healthForm.birthDate) {
      nextErrors.birthDate = "Data de nascimento é obrigatória.";
    }
    if (healthForm.hasInjuries && !healthForm.injuries) {
      nextErrors.injuries = "Informe as lesoes.";
    }
    if (healthForm.takesMedication && !healthForm.medications.trim()) {
      nextErrors.medications = "Informe as medicações utilizadas.";
    }
    if (healthForm.usesSupplementation && !healthForm.supplements.trim()) {
      nextErrors.supplements = "Informe os suplementos utilizados.";
    }

    setHealthFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return "Preencha os campos obrigatórios destacados.";
    }

    return null;
  };

  const handleHealthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHealthError(null);
    setHealthSuccess(null);
    setHealthFieldErrors({});

    const validation = validateHealth();
    if (validation) {
      setHealthError(validation);
      return;
    }

    setHealthSubmitting(true);
    try {
      const heightCm = normalizeHeightCm(healthForm.heightCm);
      const weightKg = parsePositive(healthForm.weightKg);
      if (!heightCm || !weightKg) {
        throw new Error("Altura e peso precisam ser informados.");
      }
      const payload = {
        heightCm,
        weightKg,
        bloodType: healthForm.bloodType,
        sex: healthForm.sex,
        birthDate: healthForm.birthDate,
        injuries: healthForm.hasInjuries
          ? healthForm.injuries
          : "Nenhuma",
        takesMedication: healthForm.takesMedication,
        medications: healthForm.takesMedication
          ? healthForm.medications.trim()
          : "",
        exercisesRegularly: healthForm.exercisesRegularly,
        usesSupplementation: healthForm.usesSupplementation,
        supplements: healthForm.usesSupplementation
          ? healthForm.supplements.trim()
          : "",
      };
      const response = await fetch(`${API_BASE_URL}/health/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setHealthSuccess("Dados de saude salvos. Redirecionando...");
      showSaveFeedback(
        "success",
        "Saúde salva",
        "Os dados de saúde foram atualizados.",
      );
      await redirectBasedOnRole(router);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nao foi possivel salvar a saude.";
      setHealthError(message);
      showSaveFeedback("error", "Erro ao salvar saúde", message);
    } finally {
      setHealthSubmitting(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Complete seu perfil"
        description={
          step === "profile"
            ? "Preencha CPF, telefone e seus dados pessoais."
            : "Finalize os dados de saúde para liberar o acesso ao painel."
        }
        footer={
          <>
            Ja possui acesso?{" "}
            <a
              href="/users/login"
              className="font-semibold text-[var(--gold-tone-dark)]"
            >
              Fazer login
            </a>
          </>
        }
      >
      {status === "loading" ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          Carregando informações...
        </p>
      ) : null}

      {step === "profile" && status !== "loading" ? (
        <form
          className="mt-6 space-y-6 text-left font-[var(--font-roboto)]"
          onSubmit={handleSubmit}
        >
          <label className={labelClassName}>
            CPF{" "}
            <span className={labelHintClassName}>
              (somente numeros)
            </span>
            <input
              type="text"
              name="cpf"
              placeholder="12345678909"
              autoComplete="off"
              value={sanitizedCpf}
              onChange={(event) => {
                const rawValue = event.target.value.replace(/\D/g, "");
                setCpf(rawValue.slice(0, 11));
                setProfileFieldErrors((prev) => ({ ...prev, cpf: undefined }));
              }}
              maxLength={11}
              className={`${inputBaseClassName} ${
                profileFieldErrors.cpf
                  ? inputErrorClassName
                  : inputBorderClassName
              }`}
            />
            {profileFieldErrors.cpf ? (
              <p className="text-xs text-red-400">{profileFieldErrors.cpf}</p>
            ) : null}
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClassName}>
              Nome
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setProfileFieldErrors((prev) => ({
                    ...prev,
                    name: undefined,
                  }));
                }}
                className={`${inputBaseClassName} ${
                  profileFieldErrors.name
                    ? inputErrorClassName
                    : inputBorderClassName
                }`}
              />
              {profileFieldErrors.name ? (
                <p className="text-xs text-red-400">{profileFieldErrors.name}</p>
              ) : null}
            </label>
            <label className={labelClassName}>
              Telefone
              <input
                type="tel"
                name="phone"
                placeholder="(21) 99999-9999"
                autoComplete="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setProfileFieldErrors((prev) => ({
                    ...prev,
                    phone: undefined,
                  }));
                }}
                className={`${inputBaseClassName} ${
                  profileFieldErrors.phone
                    ? inputErrorClassName
                    : inputBorderClassName
                }`}
              />
              {profileFieldErrors.phone ? (
                <p className="text-xs text-red-400">{profileFieldErrors.phone}</p>
              ) : null}
            </label>
          </div>
          <label className={labelClassName}>
            Endereço
            <input
              type="text"
              name="address"
              placeholder="Rua, numero, bairro"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={`${inputBaseClassName} ${inputBorderClassName}`}
            />
          </label>
          <label className={labelClassName}>
            Foto de perfil
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setImageFile(file ?? null);
              }}
              className={`${inputBaseClassName} ${inputBorderClassName} file:rounded-[16px] file:border-0 file:bg-[var(--card)] file:px-4 file:py-2 file:text-[var(--foreground)] file:text-xs file:font-semibold file:tracking-[0.2rem]`}
            />
            {imageFile ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                Arquivo selecionado: {imageFile.name}
              </p>
            ) : existingAvatarUrl ? (
              <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                <img
                  src={existingAvatarUrl}
                  alt="Foto atual"
                  className="h-10 w-10 rounded-full object-cover"
                />
                Usaremos sua foto do Google se nenhuma nova for enviada.
              </div>
            ) : (
              <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                Opcional
              </p>
            )}
          </label>
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : success ? (
            <p className="text-sm text-emerald-300">{success}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18rem] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70 sm:tracking-[0.4rem]"
          >
            {isSubmitting ? "Salvando..." : "Salvar e continuar"}
          </button>
        </form>
      ) : null}

      {step === "health" && status !== "loading" ? (
        <form
          className="mt-6 space-y-6 text-left font-[var(--font-roboto)]"
          onSubmit={handleHealthSubmit}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClassName}>
              Altura (cm)
              <input
                type="number"
                value={healthForm.heightCm}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    heightCm: event.target.value,
                  }))
                }
                onInput={() =>
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    heightCm: undefined,
                  }))
                }
                className={`${inputBaseClassName} ${
                  healthFieldErrors.heightCm
                    ? inputErrorClassName
                    : inputBorderClassName
                }`}
              />
              {healthFieldErrors.heightCm ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.heightCm}
                </p>
              ) : null}
            </label>
            <label className={labelClassName}>
              Peso (kg)
              <input
                type="number"
                value={healthForm.weightKg}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    weightKg: event.target.value,
                  }))
                }
                onInput={() =>
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    weightKg: undefined,
                  }))
                }
                className={`${inputBaseClassName} ${
                  healthFieldErrors.weightKg
                    ? inputErrorClassName
                    : inputBorderClassName
                }`}
              />
              {healthFieldErrors.weightKg ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.weightKg}
                </p>
              ) : null}
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClassName}>
              Tipo sanguineo
              <div className="relative">
                <select
                  value={healthForm.bloodType}
                  onChange={(event) => {
                    setHealthForm((prev) => ({
                      ...prev,
                      bloodType: event.target.value,
                    }));
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      bloodType: undefined,
                    }));
                  }}
                  className={`w-full appearance-none rounded-xl border bg-[color:var(--muted)] px-4 py-3 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--border-glow)] ${
                    healthForm.bloodType
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  } ${
                    healthFieldErrors.bloodType
                      ? inputErrorClassName
                      : inputBorderClassName
                  }`}
                >
                  <option value="">Selecione</option>
                  {bloodTypeOptions.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      className="bg-[color:var(--card)] text-[var(--foreground)]"
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              {healthFieldErrors.bloodType ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.bloodType}
                </p>
              ) : null}
            </label>
            <label className={labelClassName}>
              Sexo
              <div className="relative">
                <select
                  value={healthForm.sex}
                  onChange={(event) => {
                    setHealthForm((prev) => ({
                      ...prev,
                      sex: event.target.value,
                    }));
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      sex: undefined,
                    }));
                  }}
                  className={`w-full appearance-none rounded-xl border bg-[color:var(--muted)] px-4 py-3 pr-10 text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--border-glow)] ${
                    healthForm.sex
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  } ${
                    healthFieldErrors.sex
                      ? inputErrorClassName
                      : inputBorderClassName
                  }`}
                >
                  <option value="">Selecione</option>
                  {sexOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[color:var(--card)] text-[var(--foreground)]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              {healthFieldErrors.sex ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.sex}
                </p>
              ) : null}
            </label>
            <label className={labelClassName}>
              Data de nascimento
              <input
                type="date"
                value={healthForm.birthDate}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    birthDate: event.target.value,
                  }))
                }
                onInput={() =>
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    birthDate: undefined,
                  }))
                }
                className={`${inputBaseClassName} ${
                  healthFieldErrors.birthDate
                    ? inputErrorClassName
                    : inputBorderClassName
                }`}
              />
              {healthFieldErrors.birthDate ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.birthDate}
                </p>
              ) : null}
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={healthForm.hasInjuries}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setHealthForm((prev) => ({
                    ...prev,
                    hasInjuries: checked,
                    injuries: checked ? prev.injuries : "",
                  }));
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    injuries: undefined,
                  }));
                }}
              />
              Possui lesoes
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={healthForm.takesMedication}
                onChange={(event) => {
                  setHealthForm((prev) => ({
                    ...prev,
                    takesMedication: event.target.checked,
                  }));
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    medications: undefined,
                  }));
                }}
              />
              Usa medicacao
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={healthForm.exercisesRegularly}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    exercisesRegularly: event.target.checked,
                  }))
                }
              />
              Exercita regularmente
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={healthForm.usesSupplementation}
                onChange={(event) => {
                  setHealthForm((prev) => ({
                    ...prev,
                    usesSupplementation: event.target.checked,
                  }));
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    supplements: undefined,
                  }));
                }}
              />
              Usa suplementacao
            </label>
          </div>
          {healthForm.hasInjuries ? (
            <label className={labelClassName}>
              Lesoes
              <input
                type="text"
                value={healthForm.injuries}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    injuries: event.target.value,
                  }))
                }
                onInput={() =>
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    injuries: undefined,
                  }))
                }
                className={`${inputBaseClassName} ${
                  healthFieldErrors.injuries
                    ? inputErrorClassName
                    : inputBorderClassName
                }`}
              />
              {healthFieldErrors.injuries ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.injuries}
                </p>
              ) : null}
            </label>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClassName}>
              Medicacoes
              <input
                type="text"
                value={healthForm.medications}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    medications: event.target.value,
                  }))
                }
                onInput={() =>
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    medications: undefined,
                  }))
                }
                disabled={!healthForm.takesMedication}
                className={`${inputBaseClassName} ${
                  healthFieldErrors.medications
                    ? inputErrorClassName
                    : inputBorderClassName
                } disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
              />
              {healthFieldErrors.medications ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.medications}
                </p>
              ) : null}
            </label>
            <label className={labelClassName}>
              Suplementos
              <input
                type="text"
                value={healthForm.supplements}
                onChange={(event) =>
                  setHealthForm((prev) => ({
                    ...prev,
                    supplements: event.target.value,
                  }))
                }
                onInput={() =>
                  setHealthFieldErrors((prev) => ({
                    ...prev,
                    supplements: undefined,
                  }))
                }
                disabled={!healthForm.usesSupplementation}
                className={`${inputBaseClassName} ${
                  healthFieldErrors.supplements
                    ? inputErrorClassName
                    : inputBorderClassName
                } disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
              />
              {healthFieldErrors.supplements ? (
                <p className="text-xs text-red-400">
                  {healthFieldErrors.supplements}
                </p>
              ) : null}
            </label>
          </div>
          {healthError ? (
            <p className="text-sm text-red-400">{healthError}</p>
          ) : healthSuccess ? (
            <p className="text-sm text-emerald-300">{healthSuccess}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("profile")}
              className="flex-1 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18rem] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] sm:tracking-[0.4rem]"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={healthSubmitting}
              className="flex-1 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18rem] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70 sm:tracking-[0.4rem]"
            >
              {healthSubmitting ? "Salvando..." : "Salvar saude"}
            </button>
          </div>
        </form>
      ) : null}
      </AuthCard>
      {saveFeedback.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 text-[var(--foreground)] shadow-[0_24px_60px_-24px_var(--shadow)]">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  saveFeedback.status === "success"
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-red-400/40 bg-red-500/15 text-red-300"
                }`}
              >
                <span className="text-base font-semibold">
                  {saveFeedback.status === "success" ? "OK" : "!"}
                </span>
              </span>
              <div>
                <p className="text-sm font-semibold">{saveFeedback.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Esta mensagem fecha automaticamente em 5 segundos.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4 text-sm text-[var(--foreground)]">
              {saveFeedback.message}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

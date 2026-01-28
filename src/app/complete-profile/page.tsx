"use client";

import { type FormEvent, useMemo, useState } from "react";
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

const completeProfile = async (payload: {
  cpf: string;
  name?: string;
  phone?: string;
  address?: string;
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

export default function CompleteProfilePage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sanitizedCpf = useMemo(() => cpf.replace(/\D/g, ""), [cpf]);

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

    if (sanitizedCpf.length !== 11) {
      setError("CPF deve conter exatamente 11 digitos numericos.");
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
      });
      setSuccess("Perfil atualizado. Redirecionando...");
      await redirectBasedOnRole(router);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo inesperado aconteceu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Complete seu perfil"
      description="Adicione o CPF e outros dados pendentes para liberar o acesso ao painel."
      footer={
        <>
          Ja possui acesso?{" "}
          <a href="/users/login" className="font-semibold text-[var(--gold-tone-dark)]">
            Fazer login
          </a>
        </>
      }
    >
      <form
        className="mt-6 space-y-6 text-left font-[var(--font-nunito-sans)]"
        onSubmit={handleSubmit}
      >
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
          CPF <span className="text-[0.65rem] font-normal normal-case">(somente numeros)</span>
          <input
            type="text"
            name="cpf"
            placeholder="12345678909"
            autoComplete="off"
            value={sanitizedCpf}
            onChange={(event) => {
              const rawValue = event.target.value.replace(/\D/g, "");
              setCpf(rawValue.slice(0, 11));
            }}
            maxLength={11}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
            Nome
            <input
              type="text"
              name="name"
              placeholder="Nome completo"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
            Telefone
            <input
              type="tel"
              name="phone"
              placeholder="(21) 99999-9999"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none"
            />
          </label>
        </div>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
          Endereço
          <input
            type="text"
            name="address"
            placeholder="Rua, numero, bairro"
            autoComplete="street-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-transparent px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none"
          />
        </label>
        <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.3rem] text-[var(--foreground)]">
          Foto de perfil
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setImageFile(file ?? null);
            }}
            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--gold-tone-dark)] focus:outline-none file:rounded-[16px] file:border-0 file:bg-[var(--card)] file:px-4 file:py-2 file:text-[var(--foreground)] file:uppercase file:tracking-[0.4rem]"
          />
          {imageFile ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              Arquivo selecionado: {imageFile.name}
            </p>
          ) : (
            <p className="text-[0.65rem] text-[var(--muted-foreground)]">Opcional</p>
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
          className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.4rem] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Salvando..." : "Salvar e continuar"}
        </button>
        <p className="text-[0.65rem] text-[var(--muted-foreground)]">
          Após o pagamento confirmado, completaremos também os dados de saúde.
        </p>
      </form>
    </AuthCard>
  );
}

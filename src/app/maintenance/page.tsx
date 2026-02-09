import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:3001";

type SystemSettingsResponse = {
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
};

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const getMaintenanceMessage = async () => {
  try {
    const response = await fetch(buildApiUrl("/system-settings"), {
      cache: "no-store",
    });
    if (!response.ok) {
      return "Estamos em manutenção no momento. Tente novamente em breve.";
    }
    const data = (await response.json()) as SystemSettingsResponse;
    const message = data.maintenanceMessage?.trim();
    if (message) {
      return message;
    }
    return "Estamos em manutenção no momento. Tente novamente em breve.";
  } catch {
    return "Estamos em manutenção no momento. Tente novamente em breve.";
  }
};

export const metadata: Metadata = {
  title: "Manutenção",
  description: "Sistema temporariamente em manutenção.",
};

export default async function MaintenancePage() {
  const maintenanceMessage = await getMaintenanceMessage();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center py-14">
      <article className="relative w-full overflow-hidden rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-8 shadow-[0_24px_60px_-30px_var(--shadow)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--gold-tone)]/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--danger)]">
            <ShieldAlert className="h-4 w-4" />
            Manutenção
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            Sistema temporariamente indisponível
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            {maintenanceMessage}
          </p>
        </div>
      </article>
    </section>
  );
}

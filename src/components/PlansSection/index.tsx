import Link from "next/link";

export interface PlanOption {
  id: string;
  title: string;
  price: string;
  description: string;
  perks: string[];
  badge?: string;
  featured?: boolean;
}

export function PlansSection({ plans }: { plans: PlanOption[] }) {
  return (
    <section id="planos" className="space-y-8">
      <div className="mx-auto max-w-6xl space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.6rem] text-[var(--gold-tone-dark)]">
          Planos com foco em constância
        </p>
        <h2 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
          Escolha o caminho que combina com seu ritmo
        </h2>
        <p className="mx-auto max-w-2xl text-base text-[var(--muted-foreground)]">
          Cada plano foi desenhado para garantir acompanhamento técnico e espaço acolhedor. Qualquer etapa pode ser ajustada para
          ampliar o seu desempenho.
        </p>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isFeatured = plan.featured;
            return (
              <article
                key={plan.title}
                className={`flex flex-col gap-5 rounded-[28px] border px-6 py-6 shadow-[0_20px_40px_var(--shadow)] transition-all ${
                  isFeatured
                    ? "border-[var(--gold-tone)] bg-gradient-to-br from-[#151513] via-[#1b190f] to-[#11100a]"
                    : "border-[color:var(--border-dim)] bg-[color:var(--card)]"
                }`}
              >
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4rem] text-[#f5d98c]">
                    {plan.badge ?? "Plano JM"}
                  </p>
                  <h3
                    className={`text-2xl font-semibold ${
                      isFeatured ? "text-white" : "text-[var(--foreground)]"
                    }`}
                  >
                    {plan.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      isFeatured ? "text-white/80" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-4xl font-bold text-[var(--gold-tone)]">{plan.price}</p>
                  <ul
                    className={`space-y-2 text-sm ${
                      isFeatured ? "text-white/90" : "text-[var(--foreground)]"
                    }`}
                  >
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--gold-tone-dark)]" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/users/login${
                    plan.id ? `?planId=${encodeURIComponent(plan.id)}` : ""
                  }`}
                  className="mt-auto inline-flex items-center justify-center rounded-full border border-[#C2A537]/50 bg-[#C2A537]/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.4rem] text-[var(--gold-tone)] transition hover:border-[var(--gold-tone)] hover:bg-[#C2A537]/20"
                >
                  Garantir vaga
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

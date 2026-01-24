import Link from "next/link";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Check-in", href: "/checkin" },
  { label: "Login", href: "/users/login" },
  { label: "Eventos", href: "#events" },
  { label: "Contatos", href: "#contatos" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contatos"
      className="mt-16 border-t border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-12 text-sm text-[var(--muted-foreground)] backdrop-blur-xl sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.6rem] text-[var(--gold-tone-dark)]">
            JM Fitness Studio
          </p>
          <p className="text-base font-semibold text-[var(--foreground)]">
            Rua General Câmara, 18, sala 311
            <br />25 de Agosto, Duque de Caxias - RJ
          </p>
          <p className="text-[var(--gold-tone-dark)]">
            (21) 98099-5749 • atendimento@jmfitness.com.br
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4rem] text-[var(--gold-tone-dark)]">
            Navegue
          </p>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3rem]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full border border-[color:var(--border-dim)] px-3 py-1 transition hover:border-[var(--gold-tone)] hover:text-[var(--gold-tone)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
          <p>© {currentYear} JM Fitness Studio</p>
          <p>Projeto inspirado no branding oficial do estúdio.</p>
        </div>
      </div>
    </footer>
  );
}

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
      className="safe-area-x safe-area-bottom mt-10 border-t border-[color:var(--border-dim)] bg-[color:var(--card)] py-6 text-sm text-[var(--muted-foreground)] backdrop-blur-xl sm:py-10"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-[0.6rem] uppercase tracking-[0.5rem] text-[var(--gold-tone-dark)] sm:text-xs sm:tracking-[0.6rem]">
            JM Fitness Studio
          </p>
          <p className="text-sm font-semibold text-[var(--foreground)] sm:text-base">
            Rua General Câmara, 18, sala 311
            <br />25 de Agosto, Duque de Caxias - RJ
          </p>
          <p className="text-xs text-[var(--gold-tone-dark)] sm:text-sm">
            (21) 98099-5749 • atendimento@jmfitness.com.br
          </p>
        </div>

        <div className="hidden space-y-3 md:block">
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

        <div className="space-y-1 text-[0.65rem] text-[var(--muted-foreground)] sm:text-xs">
          <p>© {currentYear} JM Fitness Studio</p>
          <p>Projeto inspirado no branding oficial do estúdio.</p>
        </div>
      </div>
    </footer>
  );
}

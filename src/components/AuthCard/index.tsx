import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  description,
  eyebrow = "JM Fitness Studio",
  children,
  footer,
}: AuthCardProps) {
  return (
    <section className="flex w-full flex-1 items-center justify-center py-8 font-[var(--font-roboto)] sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center">
        <div className="scroll-glow w-full max-w-md rounded-[32px] border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 shadow-[0_24px_60px_var(--shadow)] sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-extrabold uppercase tracking-[0.22rem] text-[var(--gold-tone)] font-[var(--font-roboto)] sm:text-md sm:tracking-[0.5rem]">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold text-[var(--foreground)]">
              {title}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {description}
            </p>
          </div>
          {children}
        </div>

        {footer ? (
          <div className="text-xs text-[var(--muted-foreground)]">{footer}</div>
        ) : null}
      </div>
    </section>
  );
}

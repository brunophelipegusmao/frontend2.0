import Image from "next/image";

type GoogleLoginButtonProps = {
  href?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function GoogleLoginButton({
  href,
  label = "Continuar com Google",
  onClick,
  className,
}: GoogleLoginButtonProps) {
  const content = (
    <>
      <span className="flex h-6 w-6 items-center justify-center">
        <Image
          src="/icon/google-btn.svg"
          alt="Google"
          width={20}
          height={20}
          className="h-5 w-5"
        />
      </span>
      <span>{label}</span>
    </>
  );

  const baseClassName =
    "group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] hover:shadow-[0_12px_30px_var(--shadow)] font-[var(--font-roboto)]";
  const mergedClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName;

  if (href) {
    return (
      <a href={href} className={mergedClassName}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={mergedClassName}>
      {content}
    </button>
  );
}

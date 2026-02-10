"use client";

import { useEffect, useMemo, useState } from "react";

type InstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptChoice>;
}

type InstallAppButtonProps = {
  className?: string;
  showIosHint?: boolean;
  iconOnly?: boolean;
};

function InstallBrowserLikeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 3.5H20C20.83 3.5 21.5 4.17 21.5 5V15.25C21.5 16.08 20.83 16.75 20 16.75H4C3.17 16.75 2.5 16.08 2.5 15.25V5C2.5 4.17 3.17 3.5 4 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20.5H15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5V11.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.9 10.8L12 12.9L14.1 10.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const isIosDevice = () => {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

const isStandaloneMode = () => {
  if (typeof window === "undefined") {
    return false;
  }
  const displayModeStandalone = window.matchMedia("(display-mode: standalone)")
    .matches;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;
  return displayModeStandalone || iosStandalone;
};

export function InstallAppButton({
  className,
  showIosHint = false,
  iconOnly = false,
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isLikelyChromium, setIsLikelyChromium] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());
    setIsIos(isIosDevice());
    const userAgent = navigator.userAgent.toLowerCase();
    const chromiumLike =
      /(chrome|chromium|edg|opr|samsungbrowser)/.test(userAgent) &&
      !/(firefox|fxios)/.test(userAgent);
    setIsLikelyChromium(chromiumLike);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const shouldShowButton = useMemo(() => {
    if (isInstalled) {
      return false;
    }
    if (isIos) {
      return true;
    }
    return Boolean(deferredPrompt) || isLikelyChromium;
  }, [deferredPrompt, isInstalled, isIos, isLikelyChromium]);

  const handleInstallClick = async () => {
    if (isInstalling) {
      return;
    }

    if (!deferredPrompt) {
      window.alert(
        "Use o menu do navegador e escolha 'Instalar app' ou 'Adicionar à tela inicial'.",
      );
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  if (shouldShowButton) {
    const buttonClassName =
      className ||
      (iconOnly
        ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] text-[var(--background)]"
        : "rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2rem] text-[var(--background)]");
    return (
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        className={buttonClassName}
        aria-label={isInstalling ? "Instalando app" : "Instalar app"}
        title={isInstalling ? "Instalando app" : "Instalar app"}
      >
        {iconOnly ? (
          isInstalling ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <InstallBrowserLikeIcon />
          )
        ) : isInstalling ? (
          "Instalando..."
        ) : (
          "Instalar app"
        )}
      </button>
    );
  }

  if (showIosHint && isIos && !isInstalled) {
    return (
      <p className="text-[10px] uppercase tracking-[0.2rem] text-[var(--muted-foreground)]">
        iOS: Compartilhar - Adicionar a Tela de Inicio
      </p>
    );
  }

  return null;
}

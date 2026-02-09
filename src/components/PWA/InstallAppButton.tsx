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
};

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
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());
    setIsIos(isIosDevice());

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
    return Boolean(deferredPrompt) && !isInstalled;
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt || isInstalling) {
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
    return (
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        className={
          className ||
          "rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2rem] text-[var(--background)]"
        }
      >
        {isInstalling ? "Instalando..." : "Instalar app"}
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

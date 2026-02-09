"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!window.isSecureContext && !isLocalhost) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // noop: falha de registro nao deve quebrar a aplicacao
    });
  }, []);

  return null;
}

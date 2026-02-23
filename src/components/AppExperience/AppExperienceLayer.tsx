"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import SwupProgressPlugin from "@swup/progress-plugin";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import headerLogo from "@/components/Header/logo-wt.svg";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/+$/,
  "",
);
const REVEAL_DURATION_MS = 1000;
const BOOT_MIN_DURATION_MS = 6500;

const MobileAppDock = dynamic(
  () => import("./MobileAppDock").then((module) => module.MobileAppDock),
  {
    ssr: false,
  },
);

const getRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
};

const isTrackableApiRequest = (url: string): boolean => {
  if (typeof window === "undefined" || !url) {
    return false;
  }
  try {
    const parsed = new URL(url, window.location.origin);
    const normalized = `${parsed.origin}${parsed.pathname}`;
    if (API_BASE_URL && normalized.startsWith(API_BASE_URL)) {
      return true;
    }
    return parsed.origin === window.location.origin && parsed.pathname.startsWith("/api/");
  } catch {
    return false;
  }
};

const isInternalNavigationClick = (
  event: MouseEvent,
  currentPathname: string,
): boolean => {
  if (event.defaultPrevented) {
    return false;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }
  const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
  if (!anchor) {
    return false;
  }
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }
  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) {
    return false;
  }
  if (url.pathname === currentPathname && url.search === window.location.search) {
    return false;
  }
  return true;
};

export function AppExperienceLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingApiRequests, setPendingApiRequests] = useState(0);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [bootMinElapsed, setBootMinElapsed] = useState(false);
  const [showBootLoader, setShowBootLoader] = useState(true);
  const [isNextContainer, setIsNextContainer] = useState(false);
  const pendingRequestsRef = useRef(0);
  const swupProgressRef = useRef<SwupProgressPlugin | null>(null);
  const lastNavigationOriginRef = useRef({ x: 0.5, y: 0.5 });
  const revealTimeoutRef = useRef<number | null>(null);
  const revealRafOneRef = useRef<number | null>(null);
  const revealRafTwoRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);

  const clearRevealTimers = useCallback(() => {
    if (revealTimeoutRef.current !== null) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (revealRafOneRef.current !== null) {
      window.cancelAnimationFrame(revealRafOneRef.current);
      revealRafOneRef.current = null;
    }
    if (revealRafTwoRef.current !== null) {
      window.cancelAnimationFrame(revealRafTwoRef.current);
      revealRafTwoRef.current = null;
    }
  }, []);

  const setRevealOrigin = useCallback((x: number, y: number) => {
    if (typeof document === "undefined") {
      return;
    }

    const normalizedX = Math.min(0.95, Math.max(0.05, x));
    const normalizedY = Math.min(0.95, Math.max(0.05, y));

    document.documentElement.style.setProperty("--click-x", normalizedX.toString());
    document.documentElement.style.setProperty("--click-y", normalizedY.toString());
    lastNavigationOriginRef.current = { x: normalizedX, y: normalizedY };
  }, []);

  const triggerCircleReveal = useCallback(
    (x: number, y: number) => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }

      setRevealOrigin(x, y);
      clearRevealTimers();

      const html = document.documentElement;
      html.classList.add("is-changing", "to-circle");

      setIsNextContainer(true);
      revealRafOneRef.current = window.requestAnimationFrame(() => {
        revealRafTwoRef.current = window.requestAnimationFrame(() => {
          setIsNextContainer(false);
        });
      });

      revealTimeoutRef.current = window.setTimeout(() => {
        html.classList.remove("is-changing", "to-circle");
        revealTimeoutRef.current = null;
      }, REVEAL_DURATION_MS + 120);
    },
    [clearRevealTimers, setRevealOrigin],
  );

  const ensureSwupProgress = useCallback(() => {
    if (swupProgressRef.current) {
      return swupProgressRef.current;
    }
    swupProgressRef.current = new SwupProgressPlugin({
      className: "swup-progress-bar",
      delay: 80,
      transition: 280,
      initialValue: 0.35,
      minValue: 0.12,
      finishAnimation: true,
    });
    return swupProgressRef.current;
  }, []);

  const startSwupProgress = useCallback(() => {
    const progress = ensureSwupProgress();
    progress.startShowingProgress();
  }, [ensureSwupProgress]);

  const stopSwupProgress = useCallback(() => {
    const progress = ensureSwupProgress();
    progress.stopShowingProgress();
  }, [ensureSwupProgress]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const originalFetch = window.fetch.bind(window);

    window.fetch = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const requestUrl = getRequestUrl(input);
      const shouldTrack = isTrackableApiRequest(requestUrl);

      if (shouldTrack) {
        pendingRequestsRef.current += 1;
        setPendingApiRequests(pendingRequestsRef.current);
      }

      try {
        return await originalFetch(input, init);
      } finally {
        if (shouldTrack) {
          pendingRequestsRef.current = Math.max(0, pendingRequestsRef.current - 1);
          setPendingApiRequests(pendingRequestsRef.current);
        }
      }
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    startSwupProgress();
    return () => {
      swupProgressRef.current?.hideProgressBar();
    };
  }, [startSwupProgress]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBootMinElapsed(true);
    }, BOOT_MIN_DURATION_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!bootMinElapsed || pendingApiRequests > 0) {
      return;
    }
    setRevealOrigin(0.5, 0.5);
    setShowBootLoader(false);

    const revealDelay = window.setTimeout(() => {
      triggerCircleReveal(0.5, 0.5);
      setIsRouteLoading(false);
    }, 70);

    return () => {
      window.clearTimeout(revealDelay);
    };
  }, [bootMinElapsed, pendingApiRequests, setRevealOrigin, triggerCircleReveal]);

  useEffect(() => {
    const shouldShowProgress = showBootLoader || isRouteLoading || pendingApiRequests > 0;
    if (shouldShowProgress) {
      startSwupProgress();
      return;
    }
    stopSwupProgress();
  }, [
    isRouteLoading,
    pendingApiRequests,
    showBootLoader,
    startSwupProgress,
    stopSwupProgress,
  ]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const syncAuthState = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me/status`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!active) {
          return;
        }
        setIsAuthenticated(response.ok);
      } catch (error) {
        if (!active) {
          return;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setIsAuthenticated(false);
      }
    };

    void syncAuthState();

    return () => {
      active = false;
      controller.abort();
    };
  }, [pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!isInternalNavigationClick(event, pathname)) {
        return;
      }
      setRevealOrigin(
        event.clientX / window.innerWidth,
        event.clientY / window.innerHeight,
      );
      setIsRouteLoading(true);
    };

    const handlePopState = () => {
      setRevealOrigin(0.5, 0.5);
      setIsRouteLoading(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, setRevealOrigin]);

  useEffect(() => {
    if (showBootLoader) {
      previousPathnameRef.current = pathname;
      return;
    }

    if (previousPathnameRef.current !== pathname) {
      const { x, y } = lastNavigationOriginRef.current;
      triggerCircleReveal(x, y);
      previousPathnameRef.current = pathname;
      setIsRouteLoading(false);
      return;
    }

    previousPathnameRef.current = pathname;
  }, [pathname, showBootLoader, triggerCircleReveal]);

  useEffect(() => {
    if (!isRouteLoading) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 1900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isRouteLoading]);

  useEffect(() => {
    return () => {
      clearRevealTimers();
      document.documentElement.classList.remove("is-changing", "to-circle");
    };
  }, [clearRevealTimers]);

  return (
    <>
      <div
        id="swup"
        className={`app-route-content transition-reveal ${isNextContainer ? "is-next-container" : ""}`}
      >
        {children}
      </div>

      <AnimatePresence>
        {showBootLoader && (
          <motion.div
            className="app-boot-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="app-boot-loader__canvas">
              <div className="app-boot-loader__logo-shell" aria-hidden="true">
                <Image
                  src={headerLogo}
                  alt=""
                  width={320}
                  height={80}
                  className="app-boot-loader__logo"
                  priority
                />
              </div>
              <p className="app-boot-loader__text">
                {pendingApiRequests > 0
                  ? "Sincronizando dados..."
                  : "Preparando experiencia..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileAppDock pathname={pathname} isAuthenticated={isAuthenticated} />
    </>
  );
}

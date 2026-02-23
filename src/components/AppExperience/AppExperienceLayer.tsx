"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck2,
  Home,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import SwupProgressPlugin from "@swup/progress-plugin";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/+$/,
  "",
);

const MOBILE_DOCK_LINKS = [
  {
    href: "/",
    label: "Inicio",
    Icon: Home,
  },
  {
    href: "/checkin",
    label: "Check-in",
    Icon: CalendarCheck2,
  },
  {
    href: "/events",
    label: "Eventos",
    Icon: CalendarCheck2,
  },
  {
    href: "/dashboard",
    label: "Painel",
    Icon: LayoutDashboard,
  },
  {
    href: "/users/login",
    label: "Conta",
    Icon: LogIn,
  },
] as const;

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

function MobileAppDock({ pathname }: { pathname: string }) {
  return (
    <nav className="app-mobile-dock md:hidden" aria-label="Navegacao rapida">
      {MOBILE_DOCK_LINKS.map(({ href, label, Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`app-mobile-dock__item ${isActive ? "app-mobile-dock__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppExperienceLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [pendingApiRequests, setPendingApiRequests] = useState(0);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [bootMinElapsed, setBootMinElapsed] = useState(false);
  const [showBootLoader, setShowBootLoader] = useState(true);
  const pendingRequestsRef = useRef(0);
  const swupProgressRef = useRef<SwupProgressPlugin | null>(null);

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
    }, 900);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!bootMinElapsed || pendingApiRequests > 0) {
      return;
    }
    setShowBootLoader(false);
    stopSwupProgress();
  }, [bootMinElapsed, pendingApiRequests, stopSwupProgress]);

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
    const handleDocumentClick = (event: MouseEvent) => {
      if (!isInternalNavigationClick(event, pathname)) {
        return;
      }
      setIsRouteLoading(true);
    };

    const handlePopState = () => {
      setIsRouteLoading(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isRouteLoading) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 260);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isRouteLoading, pathname]);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.996 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="app-route-content"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showBootLoader && (
          <motion.div
            className="app-boot-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="app-boot-loader__panel">
              <p className="app-boot-loader__brand">JM FITNESS STUDIO</p>
              <p className="app-boot-loader__text">
                {pendingApiRequests > 0
                  ? "Sincronizando dados da sua conta..."
                  : "Preparando sua experiencia..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileAppDock pathname={pathname} />
    </>
  );
}

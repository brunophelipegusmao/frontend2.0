"use client";

import Link from "next/link";
import { CalendarCheck2, Home, LayoutDashboard, LogIn } from "lucide-react";

const MOBILE_DOCK_BASE_LINKS = [
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
] as const;

const MOBILE_DOCK_AUTH_LINK = {
  href: "/dashboard",
  label: "Painel",
  Icon: LayoutDashboard,
} as const;

const MOBILE_DOCK_LOGIN_LINK = {
  href: "/users/login",
  label: "Login",
  Icon: LogIn,
} as const;

export function MobileAppDock({
  pathname,
  isAuthenticated,
}: {
  pathname: string;
  isAuthenticated: boolean;
}) {
  const dockLinks = [
    ...MOBILE_DOCK_BASE_LINKS,
    isAuthenticated ? MOBILE_DOCK_AUTH_LINK : MOBILE_DOCK_LOGIN_LINK,
  ];

  return (
    <nav
      className="app-mobile-dock md:hidden"
      aria-label="Navegacao rapida"
      style={{ gridTemplateColumns: `repeat(${dockLinks.length}, minmax(0, 1fr))` }}
    >
      {dockLinks.map(({ href, label, Icon }) => {
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

import { NextResponse, type NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.API_URL ||
  "http://127.0.0.1:3001";

const MAINTENANCE_PATH = "/maintenance";
const CHECKIN_PATH = "/checkin";
const DASHBOARD_PATH = "/dashboard";

type SystemSettingsPayload = {
  maintenanceMode?: boolean;
};

type CurrentUserPayload = {
  role?: string | null;
};

const normalizePath = (value: string) => {
  if (!value || value === "/") {
    return "/";
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const isCheckinPath = (path: string) =>
  path === CHECKIN_PATH || path.startsWith(`${CHECKIN_PATH}/`);

const isDashboardPath = (path: string) =>
  path === DASHBOARD_PATH || path.startsWith(`${DASHBOARD_PATH}/`);

const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const getCookieHeader = (request: NextRequest): HeadersInit | undefined => {
  const cookie = request.headers.get("cookie");
  return cookie ? { cookie } : undefined;
};

const getMaintenanceMode = async (request: NextRequest) => {
  try {
    const response = await fetch(buildApiUrl("/system-settings"), {
      method: "GET",
      headers: getCookieHeader(request),
      cache: "no-store",
    });
    if (!response.ok) {
      return false;
    }
    const payload = (await response.json()) as SystemSettingsPayload;
    return payload.maintenanceMode === true;
  } catch {
    return false;
  }
};

const getCurrentRole = async (request: NextRequest) => {
  try {
    const response = await fetch(buildApiUrl("/users/me"), {
      method: "GET",
      headers: getCookieHeader(request),
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as CurrentUserPayload;
    if (typeof payload.role !== "string") {
      return null;
    }
    return payload.role.trim().toUpperCase();
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const path = normalizePath(request.nextUrl.pathname);
  const maintenanceEnabled = await getMaintenanceMode(request);

  if (!maintenanceEnabled) {
    if (path === MAINTENANCE_PATH) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (path === MAINTENANCE_PATH) {
    return NextResponse.next();
  }

  if (isCheckinPath(path)) {
    return NextResponse.next();
  }

  if (isDashboardPath(path)) {
    const role = await getCurrentRole(request);
    if (role === "MASTER" || role === "ADMIN") {
      return NextResponse.next();
    }
  }

  const redirectUrl = new URL(MAINTENANCE_PATH, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon.svg|icon.png|sw.js|manifest.webmanifest|icons|robots.txt|sitemap.xml).*)",
  ],
};

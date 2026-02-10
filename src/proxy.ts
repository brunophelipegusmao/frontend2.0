import { NextResponse, type NextRequest } from "next/server";

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:3001";

const MAINTENANCE_PATH = "/maintenance";
const CHECKIN_PATH = "/checkin";
const DASHBOARD_PATH = "/dashboard";
const MAINTENANCE_CACHE_TTL_MS = 15000;

type SystemSettingsPayload = {
  maintenanceMode?: boolean;
};

type CurrentUserPayload = {
  role?: string | null;
};

type MaintenanceCache = {
  value: boolean;
  expiresAt: number;
};

let maintenanceCache: MaintenanceCache | null = null;

const normalizePath = (value: string) => {
  if (!value || value === "/") {
    return "/";
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const isDocumentNavigationRequest = (request: NextRequest) => {
  if (request.method !== "GET") {
    return false;
  }
  if (request.headers.get("next-router-prefetch")) {
    return false;
  }
  const purpose =
    request.headers.get("purpose") ?? request.headers.get("sec-purpose");
  if (purpose?.toLowerCase().includes("prefetch")) {
    return false;
  }
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
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
  const now = Date.now();
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.value;
  }

  try {
    const response = await fetch(buildApiUrl("/system-settings"), {
      method: "GET",
      headers: getCookieHeader(request),
      cache: "no-store",
    });
    if (!response.ok) {
      if (maintenanceCache) {
        return maintenanceCache.value;
      }
      return false;
    }
    const payload = (await response.json()) as SystemSettingsPayload;
    const maintenanceMode = payload.maintenanceMode === true;
    maintenanceCache = {
      value: maintenanceMode,
      expiresAt: now + MAINTENANCE_CACHE_TTL_MS,
    };
    return maintenanceMode;
  } catch {
    if (maintenanceCache) {
      return maintenanceCache.value;
    }
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
  if (!isDocumentNavigationRequest(request)) {
    return NextResponse.next();
  }

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
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon.svg|icon.png|sw.js|manifest.webmanifest|icons|images|robots.txt|sitemap.xml).*)",
  ],
};

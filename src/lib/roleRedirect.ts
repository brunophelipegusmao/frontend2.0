"use client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ROLE_ROUTE: Record<string, string> = {
  MASTER: "/users/masterDashboard",
  ADMIN: "/users/adminDashboard",
  STAFF: "/users/staffDashboard",
  COACH: "/users/coachDashboard",
  STUDENT: "/users/studentDashboad",
  GUEST: "/users/guestDashboard",
};

type UserRole = keyof typeof ROLE_ROUTE;

export async function redirectBasedOnRole(router: {
  replace: (path: string) => void;
  push: (path: string) => void;
}) {
  const statusResponse = await fetch(`${API_BASE_URL}/users/me/status`, {
    credentials: "include",
  });
  if (!statusResponse.ok) {
    router.replace("/users/login");
    return;
  }

  const status = await statusResponse.json();
  if (!status.cpfFilled || !status.healthFilled) {
    router.replace("/complete-profile");
    return;
  }

  const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
    credentials: "include",
  });
  if (!userResponse.ok) {
    router.replace("/users/login");
    return;
  }

  const user = await userResponse.json();
  const role: UserRole = user.role as UserRole;
  const target = ROLE_ROUTE[role] ?? "/users/guestDashboard";
  router.replace(target);
}

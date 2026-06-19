import type { UserRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "เจ้าของร้าน",
  front: "พนักงานหน้าร้าน",
  kitchen: "พนักงานครัว",
  stock: "พนักงานคุมสต๊อก",
};

export const ROLE_COLORS: Record<UserRole, { color: string; bg: string; border: string }> = {
  owner: { color: "--purple", bg: "--purple-bg", border: "--purple-border" },
  front: { color: "--blue", bg: "--blue-bg", border: "--blue-border" },
  kitchen: { color: "--yellow", bg: "--yellow-bg", border: "--yellow-border" },
  stock: { color: "--cyan", bg: "--cyan-bg", border: "--cyan-border" },
};

const ROLE_ROUTES: Record<UserRole, string[]> = {
  owner: ["/orders", "/queue", "/inventory", "/menu", "/reports", "/staff"],
  front: ["/orders", "/queue"],
  kitchen: ["/orders"],
  stock: ["/inventory"],
};

export const DEFAULT_ROUTE: Record<UserRole, string> = {
  owner: "/orders",
  front: "/orders",
  kitchen: "/orders",
  stock: "/inventory",
};

export function canAccess(role: UserRole, path: string): boolean {
  const routes = ROLE_ROUTES[role];
  return routes.some((route) => path === route || path.startsWith(route + "/"));
}

export function getAllowedRoutes(role: UserRole): string[] {
  return ROLE_ROUTES[role];
}

export function canCreateOrder(role: UserRole): boolean {
  return role === "owner" || role === "front";
}

export function canManageMenu(role: UserRole): boolean {
  return role === "owner";
}

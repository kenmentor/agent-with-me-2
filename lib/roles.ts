import { useAuthStore } from "@/store/authStore";

export type UserRole = "guest" | "host" | "agent" | "admin";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  agent: 4,
  host: 3,
  guest: 1,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Guest",
  host: "Host",
  agent: "Agent",
  admin: "Admin",
};

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/dashboard/analytics",
  agent: "/dashboard/agent",
  host: "/dashboard/host",
  guest: "/dashboard/guest",
};

export function hasMinimumRole(requiredRole: UserRole): boolean {
  const user = useAuthStore.getState().user;
  if (!user?.role) return false;
  
  const userRole = user.role.toLowerCase() as UserRole;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

export function isRole(allowedRoles: UserRole[]): boolean {
  const user = useAuthStore.getState().user;
  if (!user?.role) return false;
  
  const userRole = user.role.toLowerCase() as UserRole;
  return allowedRoles.includes(userRole);
}

export function getUserRole(): UserRole | null {
  const user = useAuthStore.getState().user;
  if (!user?.role) return null;
  return user.role.toLowerCase() as UserRole;
}

export function getDashboardRoute(): string {
  const user = useAuthStore.getState().user;
  if (!user?.role) return "/auth/login";
  
  const userRole = user.role.toLowerCase() as UserRole;
  return DASHBOARD_ROUTES[userRole] || "/dashboard/guest";
}

export function canAccessRoute(pathname: string, userRole: UserRole | null): boolean {
  if (!userRole) return false;
  
  const roleRoutes: Record<UserRole, string[]> = {
    admin: ["/dashboard", "/dashboard/analytics", "/dashboard/agent", "/dashboard/host", "/dashboard/guest"],
    agent: ["/dashboard", "/dashboard/agent", "/dashboard/host", "/dashboard/guest"],
    host: ["/dashboard", "/dashboard/host", "/dashboard/guest"],
    guest: ["/dashboard", "/dashboard/guest"],
  };
  
  const allowedRoutes = roleRoutes[userRole] || [];
  return allowedRoutes.some(route => pathname.startsWith(route));
}

export function redirectToCorrectDashboard(router: any): void {
  const user = useAuthStore.getState().user;
  if (!user?.role) {
    router.replace("/auth/login");
    return;
  }
  
  const userRole = user.role.toLowerCase() as UserRole;
  const dashboardRoute = DASHBOARD_ROUTES[userRole];
  
  if (dashboardRoute) {
    router.replace(dashboardRoute);
  } else {
    router.replace("/dashboard/guest");
  }
}
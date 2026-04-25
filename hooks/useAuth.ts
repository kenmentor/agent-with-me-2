"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface UseAuthCheckOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  allowUnverified?: boolean;
}

interface AuthState {
  isReady: boolean;
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
}

export function useAuthCheck(options: UseAuthCheckOptions = {}) {
  const {
    requireAuth = false,
    redirectTo,
    allowUnverified = false,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [state, setState] = useState<AuthState>({
    isReady: false,
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });
  const redirectAttempted = useRef(false);

  useEffect(() => {
    if (!_hasHydrated) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    const isAuth = isAuthenticated && user;
    const isVerified = !user?.verifiedEmail || allowUnverified || user?.verifiedEmail;
    const isAuthAndVerified = isAuth && isVerified;

    setState({
      isReady: true,
      isAuthenticated: isAuthAndVerified,
      user: user,
      isLoading: false,
    });

    if (requireAuth && !isAuthAndVerified && !redirectAttempted.current) {
      redirectAttempted.current = true;
      const redirectPath = redirectTo || `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectPath);
    } else if (!requireAuth && isAuthAndVerified && redirectTo && !redirectAttempted.current) {
      redirectAttempted.current = true;
      router.replace(redirectTo);
    }
  }, [_hasHydrated, isAuthenticated, user, requireAuth, redirectTo, pathname, router, allowUnverified]);

  return state;
}

export function useMustBeLoggedIn(redirectPath?: string) {
  const { isReady, isAuthenticated } = useAuthCheck({
    requireAuth: true,
    redirectTo: redirectPath,
  });
  return { isReady, isAuthenticated };
}

export function useMustBeLoggedOut(redirectPath?: string) {
  const { isReady, isAuthenticated } = useAuthCheck({
    requireAuth: false,
    redirectTo: redirectPath,
  });
  return { isReady, isAuthenticated };
}

export function useIsAuthenticated() {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  return {
    isAuthenticated: _hasHydrated && isAuthenticated && !!user,
    isReady: _hasHydrated,
    user,
  };
}

export { useAuthStore };
"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useAuthStore } from "@/store/authStore";

const generateSessionId = () => {
  if (typeof window === "undefined") return null;
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
};

export function usePageTracking() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string | null>(null);
  const { user, _hasHydrated } = useAuthStore();
  const { trackEvent, trackBatchEvents } = useAnalyticsStore();

  const trackPage = useCallback(() => {
    const sessionId = sessionIdRef.current || generateSessionId();
    sessionIdRef.current = sessionId;

    const endTime = Date.now();
    const duration = Math.round((endTime - startTimeRef.current) / 1000);

    trackEvent({
      type: "page_view",
      action: "view",
      userId: user?._id || null,
      metadata: {
        page: pathname,
        duration: duration,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      },
      sessionId,
      timestamp: new Date().toISOString(),
    });

    startTimeRef.current = Date.now();
  }, [pathname, user?._id, trackEvent]);

  useEffect(() => {
    sessionIdRef.current = generateSessionId();
    trackPage();
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const endTime = Date.now();
      const duration = Math.round((endTime - startTimeRef.current) / 1000);

      const eventData = {
        type: "page_view",
        action: "view",
        userId: user?._id || null,
        metadata: {
          page: pathname,
          duration: duration,
          exit: true,
        },
        sessionId,
        timestamp: new Date().toISOString(),
      };

      navigator.sendBeacon?.(
        `${useAnalyticsStore.getState().trackEvent.toString().includes("base") ? "" : ""}`,
        JSON.stringify(eventData)
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname, user?._id]);

  return { trackPage };
}

export function trackPropertyView(propertyId: string) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "property_view",
    action: "view",
    userId: user?._id || null,
    metadata: { propertyId },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackPropertyInteraction(
  propertyId: string,
  action: "like" | "unlike" | "share" | "save" | "contact"
) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "property_interaction",
    action,
    userId: user?._id || null,
    metadata: { propertyId },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackSearch(query: string, filters: Record<string, any>) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "search",
    action: "query",
    userId: user?._id || null,
    metadata: { query, filters },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackChat(startedWith: string, propertyId?: string) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "chat",
    action: "start",
    userId: user?._id || null,
    metadata: { startedWith, propertyId },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}
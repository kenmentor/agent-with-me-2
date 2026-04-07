"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

const getDeviceInfo = () => {
  if (typeof window === "undefined") return {};
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    deviceType: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "unknown",
  };
};

const getUTMParams = () => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
    utm_term: params.get("utm_term") || null,
    utm_content: params.get("utm_content") || null,
  };
};

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams ? useSearchParams() : null;
  const startTimeRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string | null>(null);
  const maxScrollRef = useRef<number>(0);
  const scrollTrackedRef = useRef<boolean>(false);
  const { user, _hasHydrated } = useAuthStore();
  const { trackEvent } = useAnalyticsStore();

  const trackPage = useCallback(() => {
    const sessionId = sessionIdRef.current || generateSessionId();
    sessionIdRef.current = sessionId;

    const endTime = Date.now();
    const duration = Math.round((endTime - startTimeRef.current) / 1000);
    const deviceInfo = getDeviceInfo();
    const utmParams = getUTMParams();

    trackEvent({
      type: "page_view",
      action: "view",
      userId: user?._id || null,
      metadata: {
        page: pathname,
        duration: duration,
        referrer: typeof document !== "undefined" ? document.referrer : null,
        ...deviceInfo,
        ...utmParams,
        searchParams: searchParams?.toString() || null,
      },
      sessionId,
      timestamp: new Date().toISOString(),
    });

    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    scrollTrackedRef.current = false;
  }, [pathname, searchParams, user?._id, trackEvent]);

  useEffect(() => {
    sessionIdRef.current = generateSessionId();
    trackPage();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTrackedRef.current) return;
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      
      if (scrollPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollPercent;
      }

      if (scrollPercent >= 50 && !scrollTrackedRef.current) {
        scrollTrackedRef.current = true;
        const sessionId = sessionIdRef.current || generateSessionId();
        
        trackEvent({
          type: "engagement",
          action: "scroll_50",
          userId: user?._id || null,
          metadata: {
            page: pathname,
            scrollDepth: Math.round(scrollPercent),
            maxScroll: Math.round(maxScrollRef.current),
          },
          sessionId,
          timestamp: new Date().toISOString(),
        });
      }

      if (scrollPercent >= 90 && scrollTrackedRef.current) {
        const sessionId = sessionIdRef.current || generateSessionId();
        trackEvent({
          type: "engagement",
          action: "scroll_90",
          userId: user?._id || null,
          metadata: {
            page: pathname,
            scrollDepth: Math.round(scrollPercent),
          },
          sessionId,
          timestamp: new Date().toISOString(),
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, user?._id, trackEvent]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      const endTime = Date.now();
      const duration = Math.round((endTime - startTimeRef.current) / 1000);
      const deviceInfo = getDeviceInfo();

      trackEvent({
        type: "page_view",
        action: "exit",
        userId: user?._id || null,
        metadata: {
          page: pathname,
          duration,
          exit: true,
          maxScroll: Math.round(maxScrollRef.current),
          ...deviceInfo,
        },
        sessionId,
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname, user?._id, trackEvent]);

  return { trackPage };
}

export function trackPropertyView(propertyId: string, propertyType?: string, price?: number) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "property_view",
    action: "view",
    userId: user?._id || null,
    metadata: { 
      propertyId, 
      propertyType,
      price,
      source: typeof document !== "undefined" ? document.referrer : null,
    },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackPropertyInteraction(
  propertyId: string,
  action: "like" | "unlike" | "share" | "save" | "contact" | "view_contact" | "schedule_tour"
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

export function trackSearch(query: string, filters: Record<string, any>, resultsCount: number) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "search",
    action: "query",
    userId: user?._id || null,
    metadata: { query, filters, resultsCount },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackFilterChange(filterType: string, value: any) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "filter",
    action: "change",
    userId: user?._id || null,
    metadata: { filterType, value },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackButtonClick(buttonName: string, location: string) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  const pathname = usePathname();
  
  useAnalyticsStore.getState().trackEvent({
    type: "click",
    action: buttonName,
    userId: user?._id || null,
    metadata: { location, page: pathname },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackFormInteraction(formName: string, action: "start" | "submit" | "error" | "abandon") {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  const pathname = usePathname();
  
  useAnalyticsStore.getState().trackEvent({
    type: "form",
    action,
    userId: user?._id || null,
    metadata: { formName, page: pathname },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackVideoPlay(videoId: string, duration: number) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "video",
    action: "play",
    userId: user?._id || null,
    metadata: { videoId, duration },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackImageGallery(propertyId: string, imageIndex: number, totalImages: number) {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "gallery",
    action: "view",
    userId: user?._id || null,
    metadata: { propertyId, imageIndex, totalImages },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackMapInteraction(propertyId: string, action: "open" | "close" | "zoom" | "pan") {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  
  useAnalyticsStore.getState().trackEvent({
    type: "map",
    action,
    userId: user?._id || null,
    metadata: { propertyId },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}

export function trackTimeOnPage(action: "focus" | "blur") {
  const sessionId = generateSessionId();
  const { user } = useAuthStore.getState();
  const pathname = usePathname();
  
  useAnalyticsStore.getState().trackEvent({
    type: "engagement",
    action,
    userId: user?._id || null,
    metadata: { page: pathname },
    sessionId,
    timestamp: new Date().toISOString(),
  });
}
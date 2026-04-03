"use client";

import { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "awm_analytics";
const BATCH_SIZE = 20;
const FLUSH_INTERVAL = 10000;

const getSessionId = (): string => {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem("awm_session");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("awm_session", sessionId);
  }
  return sessionId;
};

interface Event {
  type: string;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface StoredData {
  events: Event[];
  lastSent: number;
}

// Get events from localStorage (persistent across sessions)
const getStoredEvents = (): Event[] => {
  if (typeof window === "undefined") return [];
  try {
    const data: StoredData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"events":[]}');
    return data.events || [];
  } catch {
    return [];
  }
};

// Save events to localStorage
const saveEvents = (events: Event[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, lastSent: Date.now() }));
  } catch {}
};

// Send events to API (batched)
const sendEvents = async (events: Event[]) => {
  if (events.length === 0) return;
  
  try {
    await fetch("/api/analytics/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
    
    // Clear sent events from storage
    const remaining = getStoredEvents().slice(events.length);
    saveEvents(remaining);
  } catch {}
};

// Main flush function
const flushEvents = () => {
  const events = getStoredEvents();
  if (events.length >= BATCH_SIZE) {
    const batch = events.slice(0, BATCH_SIZE);
    sendEvents(batch);
  }
};

// Schedule periodic flush
let flushInterval: ReturnType<typeof setInterval> | null = null;

const startFlushInterval = () => {
  if (flushInterval) return;
  flushInterval = setInterval(flushEvents, FLUSH_INTERVAL);
};

// Track an event (efficient - just stores locally)
export const trackEvent = (type: string, action: string, target?: string, metadata?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  
  const event: Event = {
    type,
    action,
    target,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  const events = getStoredEvents();
  events.push(event);
  
  // Keep only last 100 events to prevent localStorage overflow
  const trimmed = events.slice(-100);
  saveEvents(trimmed);
  
  // If we have enough events, flush immediately
  if (trimmed.length >= BATCH_SIZE) {
    flushEvents();
  }
  
  startFlushInterval();
};

// Flush on page unload (before user leaves)
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushEvents);
}

// Convenience tracking functions
export const trackPageView = (page: string, referrer?: string) => 
  trackEvent("pageview", page, undefined, { referrer });

export const trackClick = (element: string, target?: string) => 
  trackEvent("click", element, target);

export const trackSearch = (query: string) => 
  trackEvent("search", "query", query, { queryLength: query.length });

export const trackPropertyView = (propertyId: string, title?: string) => 
  trackEvent("property", "view", propertyId, { title });

export const trackPropertyLike = (propertyId: string, liked: boolean) => 
  trackEvent("property", liked ? "like" : "unlike", propertyId);

export const trackChatStart = (userId: string, propertyId?: string) => 
  trackEvent("chat", "start", userId, { propertyId });

export const trackSignup = (method: string) => 
  trackEvent("auth", "signup", method);

export const trackLogin = (method: string) => 
  trackEvent("auth", "login", method);

// React hook for automatic tracking
export const useAnalytics = () => {
  const lastPage = useRef<string>("");

  // Track page views
  useEffect(() => {
    if (typeof window === "undefined") return;
    const page = window.location.pathname;
    if (page !== lastPage.current) {
      lastPage.current = page;
      trackPageView(page, document.referrer);
    }
  }, []);

  // Track clicks
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("button");
      const link = target.closest("a");
      
      if (btn) {
        const text = btn.textContent?.trim() || btn.getAttribute("aria-label") || "btn";
        trackClick(text, btn.id || undefined);
      }
      
      if (link) {
        const href = link.getAttribute("href") || "";
        if (href && !href.startsWith("#") && !href.startsWith("javascript")) {
          trackClick("link", href);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => flushEvents();
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackClick,
    trackPropertyView,
    trackPropertyLike,
    trackChatStart,
    trackSignup,
    trackLogin,
  };
};
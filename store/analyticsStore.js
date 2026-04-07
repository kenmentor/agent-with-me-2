import { create } from "zustand";
import Req from "@/app/utility/axois";

const { app, base } = Req;

export const useAnalyticsStore = create((set, get) => ({
  overview: null,
  topProperties: null,
  journeys: null,
  pageVisits: null,
  pageTimeline: null,
  userRegistration: null,
  propertyAnalytics: null,
  userEngagement: null,
  conversionFunnel: null,
  sessionAnalytics: null,
  retentionAnalytics: null,
  realTimeAnalytics: null,
  userBehaviorMetrics: null,
  isLoading: false,
  error: null,

  fetchOverview: async (days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const res = await app.get(`${base}/v1/analytics/overview`, {
        params: { days },
      });
      set({ overview: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchTopProperties: async (days = 30, limit = 10) => {
    try {
      const res = await app.get(`${base}/v1/analytics/top-properties`, {
        params: { days, limit },
      });
      set({ topProperties: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching top properties:", error);
    }
  },

  fetchJourneys: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/journeys`, {
        params: { days },
      });
      set({ journeys: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching journeys:", error);
    }
  },

  fetchPageVisits: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/page-visits`, {
        params: { days },
      });
      set({ pageVisits: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching page visits:", error);
    }
  },

  fetchPageTimeline: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/page-timeline`, {
        params: { days },
      });
      set({ pageTimeline: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching page timeline:", error);
    }
  },

  fetchUserRegistration: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/user-registration`, {
        params: { days },
      });
      set({ userRegistration: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching user registration:", error);
    }
  },

  fetchPropertyAnalytics: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/property-analytics`, {
        params: { days },
      });
      set({ propertyAnalytics: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching property analytics:", error);
    }
  },

  fetchUserEngagement: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/user-engagement`, {
        params: { days },
      });
      set({ userEngagement: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching user engagement:", error);
    }
  },

  fetchConversionFunnel: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/conversion-funnel`, {
        params: { days },
      });
      set({ conversionFunnel: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching conversion funnel:", error);
    }
  },

  fetchSessionAnalytics: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/session-analytics`, {
        params: { days },
      });
      set({ sessionAnalytics: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching session analytics:", error);
    }
  },

  fetchRetentionAnalytics: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/retention-analytics`, {
        params: { days },
      });
      set({ retentionAnalytics: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching retention analytics:", error);
    }
  },

  fetchRealTimeAnalytics: async () => {
    try {
      const res = await app.get(`${base}/v1/analytics/real-time`);
      set({ realTimeAnalytics: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching real-time analytics:", error);
    }
  },

  fetchUserBehaviorMetrics: async (days = 30) => {
    try {
      const res = await app.get(`${base}/v1/analytics/user-behavior`, {
        params: { days },
      });
      set({ userBehaviorMetrics: res.data.data });
      return res.data.data;
    } catch (error) {
      console.error("Error fetching user behavior metrics:", error);
    }
  },

  trackEvent: async (eventData) => {
    try {
      await app.post(`${base}/v1/analytics/track`, eventData);
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  },

  trackBatchEvents: async (events) => {
    try {
      await app.post(`${base}/v1/analytics/track/batch`, { events });
    } catch (error) {
      console.error("Error tracking batch events:", error);
    }
  },
}));

export const trackPageView = (page, sessionId) => {
  useAnalyticsStore.getState().trackEvent({
    type: "page_view",
    action: "view",
    metadata: { page },
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

export const trackSignup = (userId, method, sessionId) => {
  useAnalyticsStore.getState().trackEvent({
    type: "signup",
    action: method || "email",
    userId,
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

export const trackLogin = (userId, method, sessionId) => {
  useAnalyticsStore.getState().trackEvent({
    type: "login",
    action: method || "email",
    userId,
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

export const trackVerification = (userId, success, sessionId) => {
  useAnalyticsStore.getState().trackEvent({
    type: "verification",
    action: success ? "success" : "failed",
    userId,
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

export const trackPropertyView = (userId, propertyId, sessionId) => {
  useAnalyticsStore.getState().trackEvent({
    type: "property_view",
    action: "view",
    userId,
    metadata: { propertyId },
    sessionId,
    timestamp: new Date().toISOString(),
  });
};

export const trackPropertyLike = (userId, propertyId, action, sessionId) => {
  useAnalyticsStore.getState().trackEvent({
    type: "property_like",
    action,
    userId,
    metadata: { propertyId },
    sessionId,
    timestamp: new Date().toISOString(),
  });
};
"use client";

import { usePageTracking } from "@/hooks/usePageTracking";

export default function AnalyticsTracker() {
  usePageTracking();
  return null;
}
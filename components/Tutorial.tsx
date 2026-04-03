"use client";

import { useEffect, useRef, useState } from "react";
import { STATUS } from "react-joyride";

interface TourStep {
  target: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface TourConfig {
  name: string;
  steps: TourStep[];
  delay?: number;
}

interface Step {
  target: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right";
  disableBeacon?: boolean;
}

interface JoyrideProps {
  steps: Step[];
  run: boolean;
  continuous?: boolean;
  showSkipButton?: boolean;
  showProgress?: boolean;
  styles?: any;
  callback?: (data: { status: string }) => void;
}

declare module "react-joyride" {
  export function Joyride(props: JoyrideProps): JSX.Element;
  export const STATUS: {
    FINISHED: string;
    SKIPPED: string;
    RUNNING: string;
  };
}

const tours: Record<string, TourConfig> = {
  properties: {
    name: "properties_tour",
    delay: 1000,
    steps: [
      { target: "body", content: "Welcome to Agent With Me! 👋 Let's show you around.", placement: "bottom" },
      { target: "input[placeholder*='Search']", content: "🔍 Search for properties by location, type, or keyword", placement: "bottom" },
      { target: "[data-tour='view-toggle']", content: "🔲 Switch between grid and feed view", placement: "bottom" },
      { target: "[data-tour='property-card']", content: "❤️ Click the heart to save properties you like", placement: "top" },
      { target: "[data-tour='add-property']", content: "🏠 Have a property? Click here to list it!", placement: "bottom" },
    ],
  },
  dashboard: {
    name: "dashboard_tour",
    delay: 1500,
    steps: [
      { target: "body", content: "Welcome to your Dashboard! 📊", placement: "bottom" },
      { target: "[data-tour='add-property']", content: "🏠 Add new properties to rent or sell", placement: "bottom" },
      { target: "[data-tour='analytics']", content: "📈 Track views, likes, and activity", placement: "bottom" },
    ],
  },
};

export default function Tutorial({ tourName = "properties", run, onComplete }: { tourName?: string; run?: boolean; onComplete?: () => void }) {
  const hasRunRef = useRef(false);
  const tourConfig = tours[tourName];
  const [joyrideRun, setJoyrideRun] = useState(false);
  
  const steps: Step[] = tourConfig?.steps.map((step) => ({
    target: step.target,
    content: step.content,
    placement: step.placement || "top",
    disableBeacon: true,
  })) || [];

  const shouldRun = () => {
    if (run !== undefined) return run;
    if (typeof window === "undefined") return false;
    const key = `tour_completed_${tourConfig?.name || tourName}`;
    return localStorage.getItem(key) !== "true" && !hasRunRef.current;
  };

  const handleCallback = (data: { status: string }) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status as any)) {
      if (tourConfig?.name) {
        localStorage.setItem(`tour_completed_${tourConfig.name}`, "true");
      }
      hasRunRef.current = true;
      setJoyrideRun(false);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (!tourConfig) return;
    const timer = setTimeout(() => {
      if (shouldRun()) {
        hasRunRef.current = true;
        setJoyrideRun(true);
      }
    }, tourConfig.delay || 1000);
    return () => clearTimeout(timer);
  }, [tourConfig]);

  if (!tourConfig || steps.length === 0) return null;

  return (
    // @ts-ignore - Joyride import issue
    <Joyride
      steps={steps}
      run={joyrideRun}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          primaryColor: "#000000",
          textColor: "#333333",
          backgroundColor: "#ffffff",
          zIndex: 9999,
        },
      }}
      callback={handleCallback}
    />
  );
}

export const resetTour = (tourName: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`tour_completed_${tourName}`);
  }
};
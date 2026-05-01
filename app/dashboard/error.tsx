"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6">
          There was a problem loading your dashboard.
        </p>
        <div className="space-x-4">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Reload Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!_hasHydrated || redirecting) return;
    
    // If not authenticated or no user data, redirect to login
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }

    // If user exists but has no role, wait - but don't stay stuck
    if (!user.role) {
      return;
    }

    setRedirecting(true);
    const role = user.role?.toLowerCase();
    
    if (role === "agent") {
      router.replace("/dashboard/agent");
    } else if (role === "host" || role === "landlord") {
      router.replace("/dashboard/landlord");
    } else {
      router.replace("/dashboard/tenant");
    }
  }, [_hasHydrated, isAuthenticated, user, router, redirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}

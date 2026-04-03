"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    
    // If not authenticated or no user data, redirect to login
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }

    // If user exists but has no role, wait (could be loading)
    if (!user.role) {
      return;
    }
    
    const role = user.role?.toLowerCase();
    
    if (role === "agent") {
      router.push("/dashboard/agent");
    } else if (role === "host" || role === "landlord") {
      router.push("/dashboard/landlord");
    } else {
      router.push("/dashboard/tenant");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}

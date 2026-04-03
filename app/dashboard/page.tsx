"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!_hasHydrated || redirecting) return;
    
    if (!user) {
      router.replace("/auth/login");
      return;
    }

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
  }, [_hasHydrated, user, router, redirecting]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}

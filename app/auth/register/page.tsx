"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Home, User, Building2, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!_hasHydrated || !mounted) return;
    if (isAuthenticated && user) {
      router.replace(searchParams.get("from") === "dashboard" ? "/dashboard" : "/properties");
    }
  }, [_hasHydrated, isAuthenticated, user, router, searchParams, mounted]);

  if (!_hasHydrated || !mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Home className="h-7 w-7 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Join Agent with Me</h1>
          <p className="text-gray-500 mt-1">What describes you best?</p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/register/tenant" className="block">
            <div className="flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">I need a house to rent </p>
                <p className="text-sm text-gray-500">Find your perfect rental home</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link href="/auth/register/agent" className="block">
            <div className="flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-purple-600 hover:bg-purple-50 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mr-4">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">I'm a Real Estate Agent</p>
                <p className="text-sm text-gray-500">List and manage properties</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </Link>

          <Link href="/auth/register/landlord" className="block">
            <div className="flex items-center p-4 rounded-xl border-2 border-gray-100 hover:border-green-600 hover:bg-green-50 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mr-4">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">I have properties to rent</p>
                <p className="text-sm text-gray-500">List your properties for tenants</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

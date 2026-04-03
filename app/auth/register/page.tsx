"use client";

import { useEffect } from "react";
import { Home, User, Building2, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roles = [
  {
    id: "tenant",
    title: "Rent a House",
    icon: User,
    href: "/auth/register/tenant",
  },
  {
    id: "agent",
    title: "Become an Agent",
    icon: Briefcase,
    href: "/auth/register/agent",
  },
  {
    id: "landlord",
    title: "Register Your House",
    icon: Building2,
    href: "/auth/register/landlord",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      const from = searchParams.get("from");
      if (from === "dashboard") {
        router.replace("/dashboard");
      } else {
        router.replace("/properties");
      }
    }
  }, [_hasHydrated, isAuthenticated, router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-black p-4 rounded-2xl">
              <Home className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black mb-3">
            Agent with Me
          </h1>
          <p className="text-xl text-gray-500">
            Find your perfect home
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link href={role.href} key={role.id}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-black cursor-pointer h-full">
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    <div className="bg-gray-100 p-4 rounded-2xl mb-6 group-hover:bg-black group-hover:scale-110 transition-all">
                      <Icon className="h-10 w-10 text-black group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold text-black mb-6">
                      {role.title}
                    </h2>
                    <Button variant="outline" className="w-full mt-auto border-2 border-black text-black hover:bg-black hover:text-white group/btn">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-black font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

import { Home } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              Agent with me
            </span>
          </Link>
          {!user.isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up Free</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;

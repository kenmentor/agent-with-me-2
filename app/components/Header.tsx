"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { Badge, Bell, Home } from "lucide-react";
import Link from "next/link";
import router, { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
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
          {user?.isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Sign Up Free</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />

                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  {[]}
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Avatar
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  <AvatarFallback>
                    {user?.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { User, Settings, LogOut, LayoutDashboard, MessageCircle, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getDisplayName } from "@/lib/utils";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  showDropdown?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export default function UserAvatar({
  size = "md",
  showDropdown = true,
  className = "",
}: UserAvatarProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const avatarUrl = user?.avater;
  const displayName = getDisplayName(user);
  const initials = displayName[0]?.toUpperCase() || "?";
  const sizeClass = sizeClasses[size];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
    setDropdownOpen(false);
  };

  if (!user) {
    return (
      <Link href="/auth/login">
        <div
          className={`
            ${sizeClass}
            rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center
            text-white border border-white/20 hover:bg-white/20 transition-colors
            cursor-pointer ${className}
          `}
        >
          <User className="w-1/2 h-1/2" />
        </div>
      </Link>
    );
  }

  const dropdownContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50"
    >
      {/* User Info Header */}
      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-2 ring-white/30">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{displayName}</p>
            <p className="text-xs text-white/70 truncate">{user.email}</p>
          </div>
        </div>
        {user.role && (
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 bg-white/20 rounded-full text-xs capitalize">
              {user.role}
            </span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Dashboard</span>
          </div>
        </Link>
        <Link href="/chat" onClick={() => setDropdownOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Messages</span>
          </div>
        </Link>
        <Link href="/payments/history" onClick={() => setDropdownOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <Wallet className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Payments</span>
          </div>
        </Link>
        <Link href="/user" onClick={() => setDropdownOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Profile</span>
          </div>
        </Link>
        <Link href="/settings" onClick={() => setDropdownOpen(false)}>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700 font-medium">Settings</span>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <div className="border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 transition-colors text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => showDropdown && setDropdownOpen(!dropdownOpen)}
        className={`
          ${sizeClass}
          rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center
          text-white border border-white/20 hover:bg-white/20 transition-all duration-200
          cursor-pointer ring-2 ring-transparent hover:ring-white/30
          ${className}
        `}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={size === "sm" ? 32 : size === "md" ? 40 : 48}
            height={size === "sm" ? 32 : size === "md" ? 40 : 48}
            quality={80}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="font-semibold">{initials}</span>
        )}
      </button>

      {/* Notification Badge */}
      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-black" />

      {/* Dropdown */}
      {showDropdown && (
        <AnimatePresence>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1">
              {dropdownContent}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

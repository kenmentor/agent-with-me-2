"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Building2,
  PlusCircle,
  LayoutDashboard,
  MessageCircle,
  User,
  Wallet,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const LOGO_SVG = (
  <svg
    width="24"
    height="32"
    viewBox="0 0 45.396 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <g>
      <path
        d="M0 0L17.9781 5.93773L18.3963 60L0 53.9894L0 0Z"
        fill="currentColor"
        fillRule="evenodd"
        transform="translate(27 0)"
      />
      <path
        d="M0 5.80534L12.975 0L12.975 53.9767L0 59L0 5.80534Z"
        fill="currentColor"
        fillOpacity="0.7"
        fillRule="evenodd"
        transform="translate(14.35 0)"
      />
      <path
        d="M0 0L14.7218 4.49413L15.0642 45.4126L0 40.8633L0 0Z"
        fill="currentColor"
        fillRule="evenodd"
        transform="translate(9.181 7.587)"
      />
      <path
        d="M0 4.32941L9.23646 0L9.23645 40.6186L0 44L0 4.32941Z"
        fill="currentColor"
        fillOpacity="0.7"
        fillRule="evenodd"
        transform="translate(0 7.587)"
      />
    </g>
  </svg>
);

export default function Header({ color }: { color?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
    setProfileOpen(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const hideBottomTabs = pathname.startsWith("/chat/") || pathname === "/user" || pathname.startsWith("/messages") || pathname === "/account";

  const userAvatar = user?.avater;
  const initials = user?.userName?.[0]?.toUpperCase() || "?";

  const navLinks = [
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Account", href: "/account", icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 text-white">
            {LOGO_SVG}
            <span className="text-lg font-bold hidden sm:block">Agent with me</span>
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`
                    text-white hover:bg-white/10 px-4
                    ${isActive(link.href) ? "bg-white/10" : ""}
                  `}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell - Desktop only */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex text-white hover:bg-white/10 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            )}

            {/* Profile / Auth - Desktop */}
            {isAuthenticated && user ? (
              <div className="hidden md:block relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={user.userName || "User"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">{initials}</span>
                    )}
                  </div>
                </Button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border overflow-hidden"
                    >
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-900">{user.userName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/dashboard" onClick={() => setProfileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-gray-700">
                            <LayoutDashboard className="w-4 h-4 mr-3" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/user" onClick={() => setProfileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-gray-700">
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Button>
                        </Link>
                        <Link href="/settings" onClick={() => setProfileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-gray-700">
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Button>
                        </Link>
                      </div>
                      <div className="border-t py-2">
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Log out
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-white text-black hover:bg-gray-100">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Only show when NOT on bottom tabs */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Only visible on md breakpoint */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-black border-t border-white/10 overflow-hidden"
          >
            {/* User Profile Section */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={user.userName || "User"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">{initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.userName}</p>
                    <p className="text-sm text-white/60 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive(link.href) ? "bg-white/10" : "hover:bg-white/5"}
                    `}
                  >
                    <link.icon className="w-5 h-5 text-white/70" />
                    <span className="text-white">{link.name}</span>
                  </div>
                </Link>
              ))}

              {/* Quick Actions for Authenticated Users */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-xs text-white/40 uppercase px-4 mb-2">Quick Actions</p>
                    <Link href="/properties/add" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                        <PlusCircle className="w-5 h-5 text-white/70" />
                        <span className="text-white">List Property</span>
                      </div>
                    </Link>
                    <Link href="/user" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                        <User className="w-5 h-5 text-white/70" />
                        <span className="text-white">Profile</span>
                      </div>
                    </Link>
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                        <Settings className="w-5 h-5 text-white/70" />
                        <span className="text-white">Settings</span>
                      </div>
                    </Link>
                  </div>
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-white text-black hover:bg-gray-100">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar - Only visible on small screens */}
      {!hideBottomTabs && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 pb-safe">
        <nav className="flex justify-around items-center h-16">
          {navLinks.slice(0, 4).map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center flex-1 py-2">
                <Icon className={`w-5 h-5 ${active ? "text-white" : "text-white/50"}`} />
                <span className={`text-xs mt-1 ${active ? "text-white" : "text-white/50"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
          {/* Profile tab */}
          {isAuthenticated ? (
            <Link href="/user" className="flex flex-col items-center justify-center flex-1 py-2">
              <User className={`w-5 h-5 ${isActive("/user") ? "text-white" : "text-white/50"}`} />
              <span className={`text-xs mt-1 ${isActive("/user") ? "text-white" : "text-white/50"}`}>
                Profile
              </span>
            </Link>
          ) : (
            <Link href="/auth/login" className="flex flex-col items-center justify-center flex-1 py-2">
              <User className="w-5 h-5 text-white/50" />
              <span className="text-xs mt-1 text-white/50">Login</span>
            </Link>
          )}
        </nav>
      </div>
      )}
    </header>
  );
}

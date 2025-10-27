"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Home,
  Building2,
  PlusCircle,
  LayoutDashboard,
  User,
  Wallet,
  ChartArea,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useWindowDimensions from "@/hooks/useWindowDimenstions";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { name: "Home", href: "/properties", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

  { name: "Upload", href: "/properties/add", icon: PlusCircle },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "payment", href: "/payments/history", icon: Wallet },
];

// pages that should display the bottom nav
const SHOW_BOTTOM_NAV_ROUTES = ["properties", "dashboard", "payments"];

export default function RootLayout() {
  const pathname = usePathname();

  const showBottomNav = SHOW_BOTTOM_NAV_ROUTES.some((path: string) => {
    console.log(pathname, path, pathname.startsWith(path.slice(0))); // ✅ fix
    return pathname.startsWith(path);
  });

  console.log("Show Bottom Nav?", showBottomNav, pathname);
  // true

  // fake notifications for now

  const activeRoute = (path: string) => pathname === path;

  return (
    <>
      {!showBottomNav && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-3px_15px_rgba(0,0,0,0.4)] z-[99]"
          role="navigation"
          aria-label="Mobile bottom navigation"
        >
          <div className="flex justify-around items-center py-2">
            {NAV_LINKS.map(({ name, href, icon: Icon }) => {
              const isActive = activeRoute(href);
              return (
                <Link
                  key={name}
                  href={href}
                  className="flex flex-col items-center touch-manipulation"
                >
                  <motion.div
                    animate={{
                      y: isActive ? -5 : 0,
                      scale: isActive ? 1.12 : 1,
                      opacity: isActive ? 1 : 0.8,
                    }}
                    whileHover={{ scale: 1.06, y: -3 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex flex-col items-center text-white"
                  >
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-blue-500/20 shadow-inner shadow-blue-400/30 ring-1 ring-blue-400/30"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors duration-300 ${
                          isActive ? "text-blue-400" : "text-white/70"
                        }`}
                        aria-hidden
                      />
                    </div>
                    <span
                      className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
                        isActive ? "text-blue-400" : "text-white/60"
                      }`}
                    >
                      {name}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </>
  );
}

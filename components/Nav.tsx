"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  LayoutDashboard,
  MessageCircle,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect, useRef } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      // Scroll down = hide, Scroll up = show
      if (currentScrollY > lastScrollY.current && isVisible) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current && !isVisible) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  const NAV_ITEMS = [
    { name: "Explore", href: "/properties", icon: Building2 },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(user && (user.role === "agent" || user.role === "host" || user.role === "landlord") ? [{ name: "Add", href: "/properties/add", icon: PlusCircle }] : []),
    { name: "Chat", href: "/chat", icon: MessageCircle },
    { name: "Account", href: "/account", icon: User },
  ];

  // Hide on chat pages (both list and individual chat)
  const HIDE_ON_PATHS = ["/chat"];
  const shouldHide = HIDE_ON_PATHS.some((path) => pathname.startsWith(path));
  
  const SHOW_ON_PAGES = ["/properties", "/dashboard", "/payments", "/account", "/user"];

  const shouldShow = SHOW_ON_PAGES.some((path) => pathname.startsWith(path)) && !shouldHide;

  if (!shouldShow) return null;

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-lg border-t border-white/10 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex items-center justify-around py-1.5">
        {NAV_ITEMS.filter(Boolean).map((item: any) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
            

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center flex-1 py-1.5 min-w-[48px]"
            >
              <div
                className={`
                  flex items-center justify-center w-9 h-9 rounded-lg
                  transition-colors duration-150
                  ${isActive ? "bg-white text-black" : "text-white/50"}
                `}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <span
                className={`
                  text-[9px] mt-0.5 font-medium
                  ${isActive ? "text-white" : "text-white/40"}
                `}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

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

const NAV_ITEMS = [
  { name: "Explore", href: "/properties", icon: Building2 },
  { name: "Add", href: "/properties/add", icon: PlusCircle },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Account", href: "/user", icon: User },
];

const SHOW_ON_PAGES = ["/properties", "/dashboard", "/chat", "/payments", "/user"];

export default function BottomNav() {
  const pathname = usePathname();

  const shouldShow = SHOW_ON_PAGES.some((path) => pathname.startsWith(path));

  if (!shouldShow) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around py-1.5">
        {NAV_ITEMS.map((item) => {
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

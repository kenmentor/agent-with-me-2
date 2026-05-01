"use client";

import { usePathname, useRouter } from "next/navigation";
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
import {
  initializeSocket,
  onEvent,
  offEvent,
  isSocketConnected,
} from "@/app/utility/socket";
import Req from "@/app/utility/axios";
import { AuthPromptDialog, useAuthPrompt } from "./AuthPromptDialog";
import { savePropertyDraft, clearPropertyDraft, getPropertyDraft, hasPropertyDraft } from "@/lib/utils";

const { base, app } = Req;

export default function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const getUserId = useAuthStore((state) => state.getUserId);
  const [isVisible, setIsVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastScrollY = useRef(0);

  // Fetch initial unread count
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;

    const userId = getUserId();
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await app.get(`${base}/v1/chat/messages/${userId}`);
        const data = res.data?.data;
        
        if (data && data.conversations) {
          let total = 0;
          Object.values(data.conversations).forEach((conv: any) => {
            total += conv.unreadCount || 0;
          });
          setUnreadCount(total);
        }
      } catch (err) {
// console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();
  }, [_hasHydrated, isAuthenticated, getUserId]);

  // Initialize socket and listen for new messages
  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;

    const userId = getUserId();
    if (!userId) return;

    const token = localStorage.getItem("token");
    if (token && !isSocketConnected()) {
      initializeSocket(token);
    }

    const handleNewMessage = (data: { message: any }) => {
      const currentUserId = getUserId();
      if (!currentUserId) return;
      
      const { message } = data;
      // Only increment if message is NOT from current user
      if (message.senderId !== currentUserId) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleMessagesRead = (data: { conversationId: string; readBy: string }) => {
      const currentUserId = getUserId();
      if (!currentUserId) return;
      
      // If someone else read our messages, we don't change count
      // We only decrement when WE read messages (handled separately)
    };

    onEvent("new_message", handleNewMessage);
    onEvent("messages_read", handleMessagesRead);

    return () => {
      offEvent("new_message", handleNewMessage);
      offEvent("messages_read", handleMessagesRead);
    };
  }, [_hasHydrated, isAuthenticated, getUserId]);

  // Decrement when viewing chat
  useEffect(() => {
    if (pathname.startsWith("/chat/") && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [pathname, unreadCount]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      
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

  const { showAuthPrompt, setShowAuthPrompt } = useAuthPrompt();

  const handleAddClick = (e: React.MouseEvent, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      setShowAuthPrompt(true);
    }
  };

  // Show Add button only to hosts and agents - NOT to guests
  const isHostOrAgent = user && (user.role === "agent" || user.role === "host");
  const addItem = {
    name: "Add",
    href: "/properties/add",
    icon: PlusCircle,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      if (!isAuthenticated) {
        setShowAuthPrompt(true);
      }
    },
    requiresAuth: isHostOrAgent
  };

  const NAV_ITEMS = [
    { name: "Explore", href: "/properties", icon: Building2 },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(isAuthenticated && isHostOrAgent ? [addItem] : []),
    { name: "Chat", href: "/chat", icon: MessageCircle, badge: unreadCount, requiresAuth: true },
    { name: "Account", href: "/account", icon: User, requiresAuth: true },
  ];

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
          
          const handleClick = (e: React.MouseEvent) => {
            if (item.onClick) {
              item.onClick(e);
            }
          };
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className="flex flex-col items-center flex-1 py-1.5 min-w-[48px] relative"
            >
              <div
                className={`
                  relative 
                  flex items-center justify-center w-9 h-9 rounded-lg
                  transition-colors duration-150
                  ${isActive ? "bg-white text-black" : "text-white/50"}
                `}
              >
                <item.icon className="w-4 h-4" />
                
                {/* Badge for unread messages */}
                {item.badge > 0 && (

                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? "99+" : item.badge} 
                  </span>
                )}
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
      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} />
    </nav>
  );
}


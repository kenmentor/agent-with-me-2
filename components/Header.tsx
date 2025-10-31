"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import useWindowDimensions from "@/hooks/useWindowDimenstions";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Building2,
  PlusCircle,
  LayoutDashboard,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import UserAvatar from "./UserAvater";

/* MOBILE NAVIGATION LINKS */
const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Properties", href: "/properties", icon: Building2 },
  { name: "Upload", href: "/upload", icon: PlusCircle },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Account", href: "/auth/login", icon: User },
];

const Header = ({ color }: { color?: string }) => {
  const [scrollState, setScrollState] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { height } = useWindowDimensions();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  // TEMP: simulate notifications
  const [hasNotification] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollState(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let headerHeight = height;
    headerHeight = height - 100;
    setHeaderOpacity(scrollState > headerHeight ? 1 : 0);
  }, [scrollState, height]);

  const activeRoute = (path: string) => pathname === path;

  return (
    <>
      {/* ================= DESKTOP HEADER ================= */}
      <header
        className="hidden md:block fixed w-full backdrop-blur-md bg-black pt-3 pb-2 "
        style={{
          backgroundColor: `${
            !color ? `rgba(0,0,0,${headerOpacity})` : `${color}`
          }`,
          zIndex: 100,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
              <svg
                width="30.396"
                height="60"
                viewBox="0 0 45.396 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    d="M0 0L17.9781 5.93773L18.3963 60L0 53.9894L0 0Z"
                    fill="#FFFFFF"
                    fillRule="evenodd"
                    transform="translate(27 0)"
                  />
                  <path
                    d="M0 5.80534L12.975 0L12.975 53.9767L0 59L0 5.80534Z"
                    fill="#C0C0C0"
                    fillRule="evenodd"
                    transform="translate(14.35 0)"
                  />
                  <path
                    d="M0 0L14.7218 4.49413L15.0642 45.4126L0 40.8633L0 0Z"
                    fill="#FFFFFF"
                    fillRule="evenodd"
                    transform="translate(9.181 7.587)"
                  />
                  <path
                    d="M0 4.32941L9.23646 0L9.23645 40.6186L0 44L0 4.32941Z"
                    fill="#C0C0C0"
                    fillRule="evenodd"
                    transform="translate(0 7.587)"
                  />
                </g>
              </svg>
              <span className="text-xl sm:text-2xl font-bold text-white">
                Agent with me
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/properties">
                <Button
                  variant="ghost"
                  className="text-white hover:border hover:bg-transparent hover:text-white"
                >
                  Properties
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:border hover:bg-transparent hover:text-white"
                >
                  About Us
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:border hover:bg-transparent hover:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-white text-black hover:text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
            <div className=" relative right-0 ">
              <div className="relative">
                <UserAvatar />
                {hasNotification && (
                  <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-white/10">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <svg
            width="20.396"
            height="30"
            viewBox="0 0 45.396 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M0 0L17.9781 5.93773L18.3963 60L0 53.9894L0 0Z"
                fill="#FFFFFF"
                fillRule="evenodd"
                transform="translate(27 0)"
              />
              <path
                d="M0 5.80534L12.975 0L12.975 53.9767L0 59L0 5.80534Z"
                fill="#C0C0C0"
                fillRule="evenodd"
                transform="translate(14.35 0)"
              />
              <path
                d="M0 0L14.7218 4.49413L15.0642 45.4126L0 40.8633L0 0Z"
                fill="#FFFFFF"
                fillRule="evenodd"
                transform="translate(9.181 7.587)"
              />
              <path
                d="M0 4.32941L9.23646 0L9.23645 40.6186L0 44L0 4.32941Z"
                fill="#C0C0C0"
                fillRule="evenodd"
                transform="translate(0 7.587)"
              />
            </g>
          </svg>
          <span className="text-[20px] sm:text-2xl font-bold text-white">
            Agent with me
          </span>
        </div>

        {/* User Avatar with Notification Dot */}
        <div className="relative">
          <UserAvatar />
          {hasNotification && (
            <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black"></span>
          )}
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAV ================= */}
    </>
  );
};

export default Header;

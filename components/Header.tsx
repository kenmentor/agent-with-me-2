"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import useWindowDimensions from "@/hooks/useWindowDimenstions";

import { Menu, X } from "lucide-react";
import Link from "next/link";

const Header = ({ color }: { color: string }) => {
  const [scrollState, setScrollState] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { height } = useWindowDimensions();

  useEffect(() => {
    const handleScroll = () => {
      setScrollState(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let headerHeight = height;
    headerHeight = height - 100;
    if (scrollState > headerHeight) {
      setHeaderOpacity(1);
    }
    if (scrollState < height) {
      setHeaderOpacity(0);
    }
    console.log("Scroll state just changed!: ", scrollState);
  }, [scrollState, height]);

  return (
    <header
      className="fixed w-full backdrop-blur-md bg-black pt-5 pb-5 "
      style={{
        backgroundColor: ` ${!color ? `rgba(0,0,0,${headerOpacity})` : color}`,
        zIndex: 100,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <svg
              width="45.396"
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

          {/* Desktop Navigation */}
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
                Sign Up Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-white/10 pt-4">
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:border hover:bg-transparent hover:text-white"
              >
                Properties
              </Button>
            </Link>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:border hover:bg-transparent hover:text-white"
              >
                About Us
              </Button>
            </Link>
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:border hover:bg-transparent hover:text-white"
              >
                Login
              </Button>
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full bg-white text-black hover:text-white">
                Sign Up Free
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

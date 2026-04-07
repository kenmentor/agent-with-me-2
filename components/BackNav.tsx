"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Home, 
  Building2, 
  LayoutDashboard, 
  User,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface BackNavProps {
  title?: string;
  showBack?: boolean;
  customBackUrl?: string;
  showQuickLinks?: boolean;
  rightElement?: React.ReactNode;
}

export default function BackNav({ 
  title, 
  showBack = true, 
  customBackUrl,
  showQuickLinks = true,
  rightElement
}: BackNavProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleBack = () => {
    if (customBackUrl) {
      router.push(customBackUrl);
    } else {
      router.back();
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-9 w-9 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {title && (
              <h1 className="text-lg font-semibold truncate max-w-[200px] md:max-w-none">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {rightElement}
            {showQuickLinks && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(true)}
                className="h-9 w-9 rounded-full hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Modal */}
      {showQuickLinks && showMenu && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold">Quick Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 grid grid-cols-4 gap-3">
              <QuickLinkButton
                icon={Home}
                label="Home"
                onClick={() => {
                  router.push("/");
                  setShowMenu(false);
                }}
              />
              <QuickLinkButton
                icon={Building2}
                label="Explore"
                onClick={() => {
                  router.push("/properties");
                  setShowMenu(false);
                }}
              />
              <QuickLinkButton
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => {
                  router.push("/dashboard");
                  setShowMenu(false);
                }}
              />
              <QuickLinkButton
                icon={User}
                label="Account"
                onClick={() => {
                  router.push("/account");
                  setShowMenu(false);
                }}
              />
            </div>

            <div className="px-4 pb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push("/properties/add");
                  setShowMenu(false);
                }}
              >
                + Add Property
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function QuickLinkButton({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </button>
  );
}

export function SimpleBackButton({ customBackUrl }: { customBackUrl?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (customBackUrl) {
      router.push(customBackUrl);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="h-9 w-9 rounded-full hover:bg-gray-100"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthPromptDialog({ open, onOpenChange }: AuthPromptDialogProps) {
  const router = useRouter();

  const handleAction = (action: "login" | "register") => {
    // Save flag so we know to auto-publish after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingPropertyPublish", "true");
    }
    onOpenChange(false);
    
    // Redirect to login or register with return URL
    const returnUrl = "/properties/add";
    if (action === "login") {
      router.push(`/auth/login?from=${encodeURIComponent(returnUrl)}`);
    } else {
      router.push(`/auth/register?from=${encodeURIComponent(returnUrl)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      // Don't allow closing - user must choose login or register
      if (!open) return;
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md" closeButton={false}>
        <DialogHeader>
          <DialogTitle>Sign In Required</DialogTitle>
          <DialogDescription>
            To publish your property, you need to sign in or create an account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button onClick={() => handleAction("login")} className="w-full">
            Sign In
          </Button>
          <Button onClick={() => handleAction("register")} variant="outline" className="w-full">
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useAuthPrompt() {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  const promptAuth = () => {
    setShowAuthPrompt(true);
  };

  return {
    showAuthPrompt,
    setShowAuthPrompt,
    promptAuth,
  };
}

"use client";

import React, { useState } from "react";
import { Building2, Mail, ArrowRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

interface AgentApplicationModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function AgentApplicationModal({ open, onClose, email }: AgentApplicationModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl">Partner With Us</DialogTitle>
          <DialogDescription className="text-base">
            Your account needs verification before you can access all features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{email}</span>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Join our network of verified agents and get:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 text-left">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Verified agent badge on listings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Priority listing visibility
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Direct tenant inquiries
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Analytics dashboard access
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Link href={`/auth/apply/partner?email=${encodeURIComponent(email)}`} onClick={onClose}>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Apply to Partner
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Dismiss & Try Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
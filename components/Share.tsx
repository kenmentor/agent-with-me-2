"use client";

import React, { useState } from "react";
import { MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";

function Share({
  _id,
  title,
  type,
  address,
  price,
  state,
}: {
  _id?: string;
  title?: string;
  type?: string;
  address?: string;
  price?: number;
  state?: string;
}) {
  const [copied, setCopied] = useState(false);
  const propertyLink = typeof window !== "undefined" ? `${window.location.origin}/properties/${_id}` : `https://agentwithme.davidnwachukwu.workers.dev/properties/${_id}`;

  const shareText = `🏠 *${title || "Property"}*\n\n📍 ${address || "N/A"}${state ? `, ${state}` : ""}\n💰 ₦${price?.toLocaleString() || "Contact for price"}\n🏷 ${type || "Property"}\n\nView details: ${propertyLink}\n\nAgent With Me`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      window.prompt("Copy this link:", propertyLink);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <CardContent className="space-y-4 p-4 sm:p-6">
      {/* Preview */}
      <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
        <p className="text-sm text-green-800 font-medium mb-1">WhatsApp Preview:</p>
        <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{shareText}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Share on WhatsApp
        </Button>

        <Button
          type="button"
          onClick={handleCopy}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Text
            </>
          )}
        </Button>
      </div>

      {/* Link */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm border border-gray-200 overflow-hidden">
        <span className="truncate text-xs sm:text-sm text-gray-600 flex-1 mr-2">
          {propertyLink}
        </span>
        <Button
          type="button"
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="shrink-0"
        >
          {copied ? "✓" : "Copy"}
        </Button>
      </div>
    </CardContent>
  );
}

export default Share;

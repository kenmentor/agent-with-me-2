"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, MessageCircle, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PropertyData {
  _id?: string;
  title?: string;
  price?: number;
  address?: string;
  state?: string;
  description?: string;
  type?: string;
  status?: string;
  thumbnail?: string;
}

interface ShareListingModalProps {
  open: boolean;
  onClose: () => void;
  property: PropertyData;
}

function generateShareMessage(prop: PropertyData): string {
  const propertyLink = `https://agent-with-me-v2.vercel.app/properties/${prop._id}`;
  const priceText = prop.price ? `₦${Number(prop.price).toLocaleString()}` : "Contact for price";
  const addressText = prop.address && prop.state ? `${prop.address}, ${prop.state}` : (prop.address || prop.state || "View listing");
  const descText = prop.description ? prop.description.substring(0, 150) + (prop.description.length > 150 ? "..." : "") : "";
  
  return `🏠 ${prop.title || "New Property Listing"}

💰 ${priceText} • 📍 ${addressText}

${descText}

📱 View details: ${propertyLink}

Find your perfect property on AgentWithMe!`;
}

export function ShareListingModal({ open, onClose, property }: ShareListingModalProps) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(() => generateShareMessage(property));

  useEffect(() => {
    if (property && property._id) {
      setMessage(generateShareMessage(property));
    }
  }, [property]);

  useEffect(() => {
    if (open && property?._id) {
      setMessage(generateShareMessage(property));
    }
  }, [open, property]);

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank", "noopener,noreferrer");
  };

  const handleFacebook = () => {
    const propertyLink = `https://agent-with-me-v2.vercel.app/properties/${property._id}`;
    const encodedURL = encodeURIComponent(propertyLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: message,
          url: `https://agent-with-me-v2.vercel.app/properties/${property._id}`,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Listing
          </DialogTitle>
          <DialogDescription>
            Spread the word about your property! Share on social media to get more visibility.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="font-semibold text-gray-900">{property.title}</p>
            <p className="text-sm text-gray-600">
              ₦{property.price?.toLocaleString()} • {property.address}, {property.state}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={handleFacebook}
              variant="outline"
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Facebook
            </Button>
          </div>

          <Button
            onClick={handleNativeShare}
            variant="outline"
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share via...
          </Button>

          <Button
            onClick={handleCopy}
            variant="ghost"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Skip & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
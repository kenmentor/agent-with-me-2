"use client";

import React, { useState } from "react";
import { Facebook, Twitter, Linkedin, MessageCircle, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { useRouter } from "next/navigation"; // ✅ FIXED IMPORT

function Share({
  _id,
  title,
  type,
  address,
  price,
  state,
  status,
  description,
  thumbnail,
}: {
  _id?: string;
  title?: string;
  type?: string;
  address?: string;
  price?: number;
  state?: string;
  status?: string;
  description?: string;
  thumbnail?: string;
}) {
  const [copied, setCopied] = useState(false);
  const propertyLink = `https://agent-with-me-v2.vercel.app/properties/${_id}`;
  const shareText = `${title?.trim() || "Property Listing"} available at ${
    address || "N/A"
  }${state ? `, ${state}` : ""}.
${description?.trim() || ""}

${"```Price:```"} ₦${price?.toLocaleString() || "Contact for price"}
${"```Type:```"} ${type || "N/A"}${"```.```"}
${"```Status:```"} ${status || "Available"}${"```.```"}

${"```text```"}${"```.```"}

${"```View full details:```"}
\n
${propertyLink}
\n

Agent With Me`;

  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(propertyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };
  const handleSocialShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedURL = encodeURIComponent(propertyLink);
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedURL}&title=${encodedText}`;
        break;
      case "whatsapp":
        // ⚡ Don't encode emojis for WhatsApp — it breaks them!
        shareUrl = `https://wa.me/?text=${shareText}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6 pb-8 bg-slate-50 pt-2">
      {/* Thumbnail Preview */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <img
          src={thumbnail ?? "/placeholder.svg"}
          alt={title}
          className="w-full h-48 sm:h-56 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 leading-snug">
            {title}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            ₦{price?.toLocaleString()} • {address}, {state}
          </p>
        </div>
      </div>

      {/* Property Link */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm text-gray-700 border border-gray-200 overflow-hidden">
        <span className="truncate text-xs sm:text-sm text-gray-600">
          {propertyLink}
        </span>
        <Button
          type="button"
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="ml-2 text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Social Share */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">
        <Button
          type="button"
          onClick={() => handleSocialShare("facebook")}
          variant="outline"
          className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Facebook className="w-4 h-4" /> Facebook
        </Button>
        <Button
          onClick={() => handleSocialShare("twitter")}
          variant="outline"
          className="rounded-full border-sky-500 text-sky-500 hover:bg-sky-50 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Twitter className="w-4 h-4" /> X
        </Button>
        <Button
          type="button"
          onClick={() => handleSocialShare("linkedin")}
          variant="outline"
          className="rounded-full border-blue-800 text-blue-800 hover:bg-blue-50 flex items-center gap-2 text-xs sm:text-sm"
        >
          <Linkedin className="w-4 h-4" /> LinkedIn
        </Button>
        <Button
          type="button"
          onClick={() => handleSocialShare("whatsapp")}
          variant="outline"
          className="rounded-full border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2 text-xs sm:text-sm"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </Button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col items-center mt-6 space-y-2">
        <Button
          type="button"
          onClick={() => router.push("/properties/add")}
          variant="link"
          className="text-green-700 text-sm sm:text-base"
        >
          + Create Another Property
        </Button>
      </div>
    </CardContent>
  );
}

export default Share;

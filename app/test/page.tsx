"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Copy,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepFiveProps {
  property: {
    _id: string;
    title: string;
    price: number;
    address: string;
    state: string;
    thumbnail: string;
  };
}

export default function StepFive({ property }: StepFiveProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const propertyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/property/${property._id}`;
  const shareText = `🏠 ${
    property.title
  }\n💰 ₦${property.price.toLocaleString()} • 📍 ${property.address}, ${
    property.state
  }\n\nCheck it out on EasyRent:\n${propertyLink}`;

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
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 px-6 bg-gray-50">
      <Card className="max-w-lg w-full text-center shadow-lg border-gray-200">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-500 w-16 h-16 animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Property Listed Successfully 🎉
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <img
              src={property.thumbnail}
              alt={property.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-4 text-left">
              <h3 className="font-semibold text-lg text-gray-800">
                {property.title}
              </h3>
              <p className="text-gray-600 text-sm">
                ₦{property.price.toLocaleString()} • {property.address},{" "}
                {property.state}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between text-sm text-gray-700 border border-gray-200">
            <span className="truncate">{propertyLink}</span>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="ml-2 text-gray-600 hover:text-gray-900"
            >
              <Copy className="w-4 h-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <Button
              onClick={() => handleSocialShare("facebook")}
              variant="outline"
              className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Facebook className="w-4 h-4 mr-1" /> Facebook
            </Button>
            <Button
              onClick={() => handleSocialShare("twitter")}
              variant="outline"
              className="rounded-full border-sky-500 text-sky-500 hover:bg-sky-50"
            >
              <Twitter className="w-4 h-4 mr-1" /> X
            </Button>
            <Button
              onClick={() => handleSocialShare("linkedin")}
              variant="outline"
              className="rounded-full border-blue-800 text-blue-800 hover:bg-blue-50"
            >
              <Linkedin className="w-4 h-4 mr-1" /> LinkedIn
            </Button>
            <Button
              onClick={() => handleSocialShare("whatsapp")}
              variant="outline"
              className="rounded-full border-green-600 text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
            </Button>
          </div>

          <div className="flex flex-col items-center mt-6 space-y-2">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Home className="w-4 h-4" /> Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push("/create-listing")}
              variant="link"
              className="text-green-700"
            >
              + Create Another Property
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

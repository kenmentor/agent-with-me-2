"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bed,
  Bath,
  Square,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  Share2,
  Home,
  ChevronRight,
  BanIcon,
  X,
  CheckCircle2,
  MessageCircle,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import AutoPlayVideo from "@/components/AutoplayVideo";
import Share from "@/components/Share";
import Req from "@/app/utility/axios";
import { useAuthStore } from "@/store/authStore";
import { trackPropertyInteraction, trackPropertyView } from "@/hooks/usePageTracking";
import { toast } from "sonner";
import { formatCurrency, formatPhoneNumber, getDisplayName, getFirstName } from "@/lib/utils";
import { Property } from "@/lib/types";
import BackNav from "@/components/BackNav";

const { app, base } = Req;

export default function PropertyDetailClient({
  property,
}: {
  property: Property;
}) {
  if (!property || !property._id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Property not found</p>
      </div>
    );
  }

  useEffect(() => {
    trackPropertyView(property?._id, property.type, property.price);
  }, [property._id, property.type, property.price]);

  const host = property.host || {};
  const [selectedImage, setSelectedImage] = useState<string>(
    property.thumbnail || property.images?.[0]?.url || "/placeholder.svg"
  );
  const [imageLoading, setImageLoading] = useState(true);
  const [IsShare, setIsShare] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [initialLikeChecked, setInitialLikeChecked] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?._id && property._id && !initialLikeChecked) {
      app.get(`${base}/v1/favorites/${user._id}`)
        .then((res) => {
          const favIds = res.data?.data?.map((fav: any) => fav.houseId?._id || fav.houseId) || [];
          setIsLiked(favIds.includes(property._id));
          setInitialLikeChecked(true);
        })
        .catch(() => setInitialLikeChecked(true));
    }
  }, [isAuthenticated, user?._id, property._id, app, base, initialLikeChecked]);

  const handleLike = async () => {
    if (!isAuthenticated || !user?._id) {
      toast.error("Please login to save properties");
      return;
    }

    setIsLiking(true);
    try {
      const response = await app.post(`${base}/v1/favorites/toggle`, {
        userId: user._id,
        houseId: property._id,
      });
      console.log("Favorite toggle response:", response.data);
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      trackPropertyInteraction(property._id, newLikedState ? "like" : "unlike");
      toast.success(newLikedState ? "Property saved!" : "Property removed from saved");
    } catch (error: any) {
      console.error("Error toggling favorite:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update favorite");
    }
    setIsLiking(false);
  };

  console.log(property)
  return (
    <>
      {IsShare && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setIsShare(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Share
            _id={property._id}
            title={property.title}
            type={property.type}
            address={property.address}
            price={property.price}
            state={property?.state}
            status={property.status}
            description={property.description}
            thumbnail={property.thumbnail}
          />
        </div>
      )}

      <BackNav 
        title={property.title?.slice(0, 25) + (property.title?.length > 25 ? "..." : "")}
        showQuickLinks={true}
      />

      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/properties" className="hover:text-gray-900">
              Properties
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 truncate max-w-[200px]">
              {property.title}
            </span>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  )}
                  <Image
                    src={selectedImage}
                    alt={property.title}
                    fill
                    className={`object-cover transition-all duration-500 ${
                      imageLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
                    }`}
                    onLoad={() => setImageLoading(false)}
                    priority
                  />
                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {property.images?.length || 1} photos
                  </div>
                </div>

                {/* Thumbnail Grid */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {property.images?.slice(0, 6).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImage(image.url);
                        setImageLoading(true);
                      }}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedImage === image.url
                          ? "ring-2 ring-black ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={`${property.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                  {property.images?.length > 6 && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                      +{property.images.length - 6}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Info Card */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Title & Location */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                          {property.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{property.address}</span>
                        </div>
                      </div>
                      <Badge
                        className={`px-3 py-1 text-sm font-medium ${
                          property.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {property.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="flex flex-wrap gap-4 py-4 border-y border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <Bed className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{property.bedrooms}</span>
                      <span className="text-gray-500 text-sm">Beds</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <Bath className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{property.bathrooms}</span>
                      <span className="text-gray-500 text-sm">Baths</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <Square className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{property.squareFeet}</span>
                      <span className="text-gray-500 text-sm">sqft</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{property.yearBuilt}</span>
                      <span className="text-gray-500 text-sm">Built</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                      <TabsTrigger
                        value="description"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Description
                      </TabsTrigger>
                      <TabsTrigger
                        value="features"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Features
                      </TabsTrigger>
                      <TabsTrigger
                        value="location"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Location
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                      <TabsContent value="description" className="space-y-4">
                        <h3 className="text-lg font-semibold">About this property</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {property.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-4">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                            {property.type}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                            {property.category}
                          </span>
                          {property.furnishing && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                              {property.furnishing}
                            </span>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="features">
                        <h3 className="text-lg font-semibold mb-4">Amenities & Features</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {property.amenities?.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="location">
                        <h3 className="text-lg font-semibold mb-4">Property Location</h3>
                        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>{property.address}</p>
                            <p className="text-sm">{property.state}, {property.lga}</p>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Video Tour */}
              {property.video && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Video Tour</h3>
                    <div className="aspect-video overflow-hidden rounded-xl bg-gray-900">
                      <AutoPlayVideo src={property.video} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Price Card */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-black text-white p-6">
                    <p className="text-sm text-gray-400 mb-1">Price</p>
                    <p className="text-3xl font-bold">{formatCurrency(property.price)}</p>
                    {property.category && (
                      <p className="text-sm text-gray-400 mt-1">per {property.category.toLowerCase()}</p>
                    )}
                  </div>
                  <CardContent className="p-6 space-y-4">
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {property?.host?.adminVerified ? (
                        <Link href={`/payments/pay/${property._id}`} className="block">
                          <Button size="lg" className="w-full h-12 text-base">
                            <Calendar className="h-5 w-5 mr-2" />
                            Book Now
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                          <BanIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-red-800">Unverified Agent</p>
                            <p className="text-red-600 text-xs mt-1">
                              This agent is not verified. Proceed with caution.
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className={`flex-1 h-11 ${isLiked ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}`}
                          onClick={handleLike}
                          disabled={isLiking}
                        >
                          <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                          {isLiked ? "Saved" : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-11"
                          onClick={() => {
                            setIsShare(true);
                            trackPropertyInteraction(property._id, "share");
                          }}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                      </div>
                    </div>

                    {/* Chat Button */}
                    <Link href={`/chat/${property.host?._id || "unknown"}/${property._id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-11 border-2 border-black hover:bg-black hover:text-white"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Chat with Agent
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Agent Card - Only show for agents/landlords */}
                {property.host?.role !== "guest" && property.host?.role !== "USER" && (
                  <Card className="border border-gray-200 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      {/* Agent Header */}
                      <Link href={`/agent/${host?._id}`} className="block">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-white/30">
                              <AvatarImage src={host?.profileImage || host?.image} />
                              <AvatarFallback className="bg-white/20 text-white">
                                {getFirstName(host)?.[0]?.toUpperCase()}}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-white">{getDisplayName(host) || "Unknown"}</h3>
                                {host.adminVerified && (
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                )}
                              </div>
                              <p className="text-sm text-gray-300">
                                {host.role === "agent" ? "Certified Agent" : 
                                 host.role === "host" ? "Property Owner" : "Agent"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Contact Info */}
                      <div className="p-4 space-y-2">
                        <a
                          href={`tel:${formatPhoneNumber(host.phoneNumber)}`}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 block truncate">
                              {formatPhoneNumber(host.phoneNumber) || "No phone"}
                            </span>
                            <span className="text-xs text-gray-500">Tap to call</span>
                          </div>
                        </a>
                        <a
                          href={`mailto:${host.email || ""}`}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 block truncate">
                              {host.email || "No email"}
                            </span>
                            <span className="text-xs text-gray-500">Tap to email</span>
                          </div>
                        </a>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 pt-0 space-y-2">
                        <Link href={`/chat/${host?._id || "unknown"}/${property._id}`} className="block">
                          <Button className="w-full bg-black hover:bg-gray-800 h-11">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat with Agent
                          </Button>
                        </Link>
                        {host.adminVerified && (
                          <Link href={`/payments/pay/${property._id}`} className="block">
                            <Button variant="outline" className="w-full h-11 border-gray-300">
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Tour
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
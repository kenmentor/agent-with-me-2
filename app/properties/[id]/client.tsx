"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { useState } from "react";
import AutoPlayVideo from "@/components/AutoplayVideo";
import Share from "@/components/Share";
import { useRouter } from "next/router";

interface Property {
  _id: string;
  title: string;
  type: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  status: string;
  video: string;
  description: string;
  category?: string;
  state?: string;
  lga?: string;
  furnishing?: string;
  amenities: string[];
  images: { url: string; type: string }[];
  thumbnail?: string;
  host: {
    _id: string;
    userName: string;
    phoneNumber: string;
    email: string;
    image: string;
    adminVerified: boolean;
  };
}

export default function PropertyDetailClient({
  property,
}: {
  property: Property;
}) {
  // Initialize selected image to thumbnail or first gallery image
  const [selectedImage, setSelectedImage] = useState<string>(
    property.thumbnail || property.images?.[0]?.url || "/placeholder.svg"
  );
  const [imageLoading, setImageLoading] = useState(true);
  const [IsShare, setIsShare] = useState(false);
  return (
    <>
      {IsShare && (
        <div className=" fixed top-0 bottom-0 bg-black/60  right-0 left-0 backdrop-blur-md  flex-col z-10 flex justify-start items-center p-6 ">
          <div className="p-8">
            <button
              className="text-white bg-black p-3 rounded-full top-0 right-0  "
              onClick={() => setIsShare(false)}
            >
              <X />
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
      <div className="container mx-auto px-4 py-8 pb-[100px]">
        {/* Breadcrumb */}

        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/properties" className="hover:text-foreground">
            Properties
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{property.title}</span>
        </div>

        {/* Title & Status */}
        <div className="mb-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{property.title}</h1>
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{property.address}</span>
              <Badge
                className={
                  property.status === "Available"
                    ? "bg-green-100 text-green-800"
                    : property.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
                variant="outline"
              >
                {property.status}
              </Badge>
            </div>
            <div className="mb-6 flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-5 w-5" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-5 w-5" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-5 w-5" />
                <span>{property.squareFeet} sq ft</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-5 w-5" />
                <span>Built in {property.yearBuilt}</span>
              </div>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex flex-col items-end justify-center">
            <div className="text-3xl font-bold">₦{property.price}</div>
            <div className="mt-4 flex gap-2">
              {!property.host.adminVerified && (
                <Link href={`/payments/pay/${property._id}`}>
                  <Button size="lg">Book Now</Button>
                </Link>
              )}
              <Button size="lg" variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsShare(true)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8 grid grid-cols-4 gap-4 relative">
          <div className="col-span-4 aspect-video overflow-hidden rounded-lg lg:col-span-2 lg:row-span-2 relative">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
            )}
            <Image
              src={selectedImage}
              alt={property.title}
              width={800}
              height={600}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoadingComplete={() => setImageLoading(false)}
            />
          </div>

          {property.images?.map((image, index) => (
            <div
              key={index}
              className="col-span-2 aspect-video overflow-hidden rounded-lg sm:col-span-1 cursor-pointer"
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={`${property.title} ${index + 1}`}
                onClick={() => {
                  setSelectedImage(image.url || "/placeholder.svg");
                  setImageLoading(true);
                }}
                width={400}
                height={300}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Tabs & Video */}
        <div className="mb-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <Tabs defaultValue="description">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <h2 className="text-2xl font-semibold">Property Description</h2>
                <p className="leading-relaxed">{property.description}</p>
              </TabsContent>

              <TabsContent value="features">
                <h2 className="mb-4 text-2xl font-semibold">
                  Property Features
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {property.amenities?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <h2 className="mb-4 text-2xl font-semibold">Location</h2>
                <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Map would be displayed here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Video Tour</h2>
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <AutoPlayVideo src={property.video} />
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="mb-5">
          {property.host.adminVerified ? (
            <Link className="!w-full" href={`/payments/pay/${property._id}`}>
              <Button size="lg">Book Now</Button>
            </Link>
          ) : (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <BanIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Secure Payment</p>
                <p className="text-red-700">
                  This agent is not verified by admin, booking is disabled. Make
                  sure you verify them before making any payment.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <Image
                src={property.host.image || "/placeholder.svg"}
                alt={property.host.userName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">{property.host.userName}</h3>
              <p className="text-sm text-muted-foreground">
                {property.host.userName}
              </p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{property.host.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{property.host.email}</span>
            </div>
            <Link href={`/chat/${property.host._id}/${property._id}`}>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 w-full bg-transparent"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Chat with agent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

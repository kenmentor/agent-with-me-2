"use client";

interface data {
  _id?: string;
  title: string;
  lga: string;
  video: string;
  country: string;
  description: string;
  views: number;
  rating: number;
  category: string;
  thumbnail: string;
  gallery: [{ url: string; type: string }];
  price: number;
  address: string;
  state: string;
  type: string;
  waterSuply: boolean;
  electricity: number;
  location: string;
  host: {
    _id: string;
    phoneNumber: number;
  };
  amenities: string[];
}
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
  MessageCircleWarning,
  MessageCircleWarningIcon,
  BanIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Req from "@/app/utility/axois";
import { useAuthStore } from "@/store/authStore";
import router from "next/router";
import { toast } from "sonner";
import AutoPlayVideo from "@/app/components/AutoplayVideo";
export default function PropertyDetailPage() {
  const { id } = useParams();
  const { app, base } = Req;
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [selectedImage, setSelectedImage] = useState<string>("hello");
  // This would normally fetch from a database based on the ID
  const [property, setProperty] = useState({
    _id: id,
    title: "Luxury Waterfront Condo",
    type: "Condo",
    address: "789 Beach Blvd, Miami, FL 33139",
    price: 2100000,
    bedrooms: 3,
    bathrooms: 3.5,
    squareFeet: 2200,
    yearBuilt: 2018,
    status: "Available",
    video: "",
    description:
      "This stunning waterfront condo offers breathtaking views of the ocean and city skyline. Featuring floor-to-ceiling windows, a gourmet kitchen with top-of-the-line appliances, and a spacious open floor plan perfect for entertaining. The master suite includes a luxurious bathroom with a soaking tub and walk-in shower. Additional amenities include a private balcony, two assigned parking spaces, and access to the building's pool, fitness center, and 24-hour concierge service.",
    amenities: [
      "Waterfront",
      "Floor-to-ceiling windows",
      "Gourmet kitchen",
      "Private balcony",
      "Walk-in closets",
      "Hardwood floors",
      "Central air conditioning",
      "In-unit laundry",
      "24-hour security",
      "Pool",
      "Fitness center",
      "Concierge service",
    ],
    gallery: [
      {
        url: "/placeholder.svg?height=600&width=800",
        type: "image/jpeg",
      },
      {
        url: "/placeholder.svg?height=600&width=800",
        type: "image/jpeg",
      },
      {
        url: "/placeholder.svg?height=600&width=800",
        type: "image/jpeg",
      },
      {
        url: "/placeholder.svg?height=600&width=800",
        type: "image/jpeg",
      },
    ],
    host: {
      _id: "agent123",
      userName: "Jane Smith",
      phone: "(305) 555-1234",
      email: "jane.smith@example.com",
      image: "/placeholder.svg?height=200&width=200",
      adminVerified: false,
    },
  });
  async function getData() {
    try {
      const res = await app.get(
        `https://agent-with-me-backend.onrender.com/v1/house/detail/${id}`
      );
      console.log("helloe", res.data.data);
      const result = res.data;

      if (result && result.data) {
        setProperty(result.data);
        const thumbnail =
          result.data.thumbnail ||
          (result.data.gallery && result.data.gallery[0]) ||
          "";
        setSelectedImage(thumbnail);
        setLoading(false);
      } else {
        console.error("Invalid data structure:", result);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    }
  }

  useEffect(() => {
    getData();
  }, ["ffj"]);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
        <div className="flex flex-col items-end justify-center">
          <div className="text-3xl font-bold">
            {formatPrice(property.price)}
          </div>
          <div className="mt-4 flex gap-2">
            <Link href={`/payments/pay/${property._id}`}>
              {property.host.adminVerified && (
                <Button size="lg">Book Now</Button>
              )}
            </Link>
            <Button size="lg" variant="outline">
              <Heart className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button size="icon" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-4">
        <div className="col-span-4 aspect-video overflow-hidden rounded-lg lg:col-span-2 lg:row-span-2">
          <Image
            src={selectedImage || "/placeholder.svg"}
            alt={property.title}
            width={800}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>
        {property.gallery?.map((image, index) => (
          <div
            key={index}
            className="col-span-2 aspect-video overflow-hidden rounded-lg sm:col-span-1"
          >
            <Image
              src={image.url || "/placeholder.svg"}
              alt={`${property.title} ${index + 1}`}
              onClick={() => setSelectedImage(image.url)}
              width={400}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div></div>
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
              <h2 className="mb-4 text-2xl font-semibold">Property Features</h2>
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
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Map would be displayed here
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Video Tour</h2>
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <AutoPlayVideo src={`${property.video}`} />
          </div>
        </div>
        <div className="mb-5 block ">
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
                  this agent is not verified by admin, you can still chat with
                  them but booking is disabled make sure you verify them before
                  making any payment
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <Image
                src={property?.host?.image || "/placeholder.svg"}
                alt={property?.host?.userName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold">{property?.host?.userName}</h3>
              <p className="text-sm text-muted-foreground">
                {property.host.userName}
              </p>
            </div>
          </div>
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{property?.host?.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{property?.host?.email}</span>
            </div>
            <Link href={`/chat/${property?.host?._id}/${property._id}`}>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent   w-full"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Chat with agent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Phone,
  Calendar,
  Star,
  Shield,
  Eye,
  Book,
} from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const mockProperties = [
    {
      id: 1,
      title: "2BHK Apartment in Bandra West",
      location: "Bandra West, Mumbai",
      price: "₦45,000/month",
      type: "rent",
      bedrooms: 2,
      bathrooms: 2,
      area: "850 sq ft",
      image: "/placeholder.svg?height=200&width=300",
      landlord: "Rajesh Kumar",
      rating: 4.5,
      verified: true,
      views: 156,
    },
    {
      id: 2,
      title: "3BHK Villa in Koregaon Park",
      location: "Koregaon Park, Pune",
      price: "₦1.2 Cr",
      type: "sale",
      bedrooms: 3,
      bathrooms: 3,
      area: "1200 sq ft",
      image: "/placeholder.svg?height=200&width=300",
      landlord: "Priya Sharma",
      rating: 4.8,
      verified: true,
      views: 89,
    },
    {
      id: 3,
      title: "1BHK Studio in Whitefield",
      location: "Whitefield, Bangalore",
      price: "₦25,000/month",
      type: "rent",
      bedrooms: 1,
      bathrooms: 1,
      area: "450 sq ft",
      image: "/placeholder.svg?height=200&width=300",
      landlord: "Amit Patel",
      rating: 4.2,
      verified: true,
      views: 67,
    },
  ];

  const toggleFavorite = (propertyId: number) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location, property type, or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Budget</SelectItem>
                <SelectItem value="0-25000">₦0 - ₦25,000</SelectItem>
                <SelectItem value="25000-50000">₦25,000 - ₦50,000</SelectItem>
                <SelectItem value="50000+">₦50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Properties for You</h1>
            <p className="text-gray-600">
              {mockProperties.length} properties found
            </p>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={property.image || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  variant={property.type === "rent" ? "default" : "secondary"}
                  className="absolute top-2 left-2"
                >
                  {property.type === "rent" ? "For Rent" : "For Sale"}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 p-2"
                  onClick={() => toggleFavorite(property.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.includes(property.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                  {property.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-bold text-blue-600">
                    {property.price}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {property.rating}
                    </span>
                  </div>
                </div>
                {"₦"}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms} Bed
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms} Bath
                  </span>
                  <span className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {property.area}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                      {property.landlord.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {property.landlord}
                    </span>
                    {property.verified && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="h-3 w-3 mr-1" />
                    {property.views}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a href="properties/hello" className="w-full">
                    <Button size="sm" className="flex-1 w-full">
                      <Book className="h-4 w-4 mr-1" />
                      Book now
                    </Button>
                  </a>
                  <a href="properties/hello" className="w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent   w-full"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Chat with agent
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

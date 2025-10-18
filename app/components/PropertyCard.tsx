"use client";
interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  thumbnail: string;
  landlord: string;
  rating: number;
  verified: boolean;
  views: number;
  host: string;
}
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

interface PropertyCardProps {
  property: Property;
  favorites: string[];
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, favorites }) => {
  function toggleFavorite(id: string): void {
    if (favorites.includes(id)) {
      // Remove from favorites
      const updated = favorites.filter((favId: string) => favId !== id);
      // If favorites is managed by parent, you should call a prop function here
      // For demo, just log
      console.log("Removed from favorites:", updated);
    } else {
      // Add to favorites
      const updated = [...favorites, id];
      // If favorites is managed by parent, you should call a prop function here
      // For demo, just log
      console.log("Added to favorites:", updated);
    }
  }

  return (
    <Card
      key={property._id}
      className="overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <img
          src={property.thumbnail || "/placeholder.svg"}
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
          onClick={() => toggleFavorite(property._id)}
        >
          <Heart
            className={`h-4 w-4 ${
              favorites.includes(property._id)
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
            {"₦"} {property.price.toLocaleString()}
          </p>
          <div className="flex items-center space-x-1">
            {property.rating && (
              <>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{property.rating}</span>
              </>
            )}
          </div>
        </div>
        {"₦"} {Math.floor(property.price / 12).toLocaleString()} /month
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
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium"></div>
            {/* <span className="text-sm text-gray-600">{property.host}</span> */}
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
          <a href={`properties/${property._id}`} className="w-full">
            <Button size="sm" className="flex-1 w-full">
              <Book className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </a>
          <a href={`/chat/${property.host}/`} className="w-full">
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
  );
};
export default PropertyCard;

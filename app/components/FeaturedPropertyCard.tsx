"use client";
interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  thumbnail: string;
  landlord: string;
  rating: number;
  verified: boolean;
  views: number;
}
import React from "react";
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

interface FeaturedPropertyCardProps {
  property: Property;
  favorites: number[];
}

const FeaturedPropertyCard: React.FC<FeaturedPropertyCardProps> = ({
  property,
  favorites,
}) => {
  function toggleFavorite(id: number): void {
    // This function should add/remove the property id from favorites.
    // Since favorites is passed as a prop, you would typically lift state up.
    // For demo, we'll just log the action.
    if (favorites.includes(id)) {
      console.log(`Removing property ${id} from favorites`);
    } else {
      console.log(`Adding property ${id} to favorites`);
    }
    // In a real app, you'd call a handler passed via props to update favorites.
  }

  return (
    <Card
      key={property.id}
      className="overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <img
          src={property?.thumbnail || "/placeholder.svg"}
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
              favorites.includes(property.id) ? "fill-red-500 text-red-500" : ""
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
          <p className="text-2xl font-bold text-blue-600">{property.price}</p>
          <div className="flex items-center space-x-1"></div>
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
  );
};
export default FeaturedPropertyCard;

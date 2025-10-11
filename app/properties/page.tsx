"use client";
interface ResourceType {
  header: string;
  views: number;
  description: string;

  thumbnail: string;
  location: string;
  gallery: { src: string; alt: string }[];
  price: number;
  electricity: number;
  waterSuply: boolean;
  _id: string;
  host: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  category: string;
  furnished: boolean;
  rating: number;
  verified: boolean;

  landlord: string;
}

interface keyword {
  min: string;
  max: string;
  type: string;
  searchWord: string;
  limit: number;
  lga?: string;
  state?: string;
  landmark?: string;
  category?: string;
  id?: string;
}

interface HouseMainComponent {
  keyword?: keyword;
  bardge?: number;
  page: boolean;
  userId?: string;
}

import { useEffect, useState } from "react";
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
import PropertyCard from "../components/PropertyCard";
import Req from "@/app/utility/axois";
export default function PropertiesPage() {
  const { base, app } = Req;
  const [searchQuery, setSearchQuery] = useState({
    keyword: "",
    type: "",
    max: 100000000,
    min: 0,
    category: "",
    lga: "",
    state: "",
    landmark: "",
    limit: "50",
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ResourceType[]>([]);

  useEffect(() => {
    //https://agent-with-me-backend.onrender.com

    const finalUrl = `${base}/v1/house?min=${searchQuery?.min || ""}   &max=${
      searchQuery?.max || ""
    }&type=${searchQuery?.type || ""}&category=${
      searchQuery?.category || ""
    }&searchWord=${searchQuery?.keyword || ""}&limit=${
      searchQuery?.limit || "50"
    }&lga=${searchQuery?.lga || ""}&state=${
      searchQuery?.state || ""
    }&landmark=${searchQuery?.landmark || ""}
   `;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        console.log(await app.get(finalUrl));
        const res = (await app.get(finalUrl)).data;
        const result = await res.data;
        console.log(result);
        console.log(searchQuery?.keyword);
        setData(result);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    console.log("gfgg");

    fetchData();
  }, [searchQuery]);

  const toggleFavorite = (propertyId: string) => {
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
                  value={searchQuery.keyword}
                  name="keyword"
                  onChange={(e) =>
                    setSearchQuery((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>
            {searchQuery.keyword}
            {searchQuery.type}
            {searchQuery.keyword}
            <Select
              name="type"
              onValueChange={(e) => {
                setSearchQuery((prev) => ({ ...prev, type: e }));
              }}
            >
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
            <p className="text-gray-600">{data?.length} properties found</p>
          </div>
        </div>

        {/* Property Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              favorites={favorites}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

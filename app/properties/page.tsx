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
import { Search, Spline } from "lucide-react";

import Header from "@/components/Header";
import PropertyCard from "../../components/PropertyCard";
import Req from "@/app/utility/axois";
import { priceRanges, propertyType, statesAndLGAs } from "../data";
import { Slider } from "@/components/ui/slider";
import NoResults from "../../components/NoResults";
import { Spinner } from "@/components/ui/spinner";
import PropertySkeleton from "@/components/PropertySkeleton";
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
    priceRange: [0, 0],
  });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ResourceType[]>([]);

  function buildHouseUrl(base: string, searchQuery: any) {
    const params: Record<string, string> = {};

    // Helper to add only valid filters
    const addParam = (key: string, value: any) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
      ) {
        params[key] = String(value);
      }
    };

    // Price range
    if (Array.isArray(searchQuery?.priceRange)) {
      if (searchQuery.priceRange[0]) addParam("min", searchQuery.priceRange[0]);
      if (searchQuery.priceRange[1]) addParam("max", searchQuery.priceRange[1]);
    }

    // Filters
    addParam("type", searchQuery?.type);
    addParam("category", searchQuery?.category);
    addParam("searchWord", searchQuery?.keyword);
    addParam("limit", searchQuery?.limit || "50");
    addParam("lga", searchQuery?.lga);
    addParam("state", searchQuery?.state);
    addParam("landmark", searchQuery?.landmark);

    // Build query string safely
    const queryString = new URLSearchParams(params).toString();
    return `${base}/v1/house${queryString ? `?${queryString}` : ""}`;
  }

  useEffect(() => {
    //https://agent-with-me-backend.onrender.com

    const finalUrl = buildHouseUrl(base, searchQuery);
    console.log(finalUrl);

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
  const formatPrice = (value: number) =>
    value >= 1000000
      ? `₦${(value / 1000000).toFixed(1)}M`
      : `₦${value.toLocaleString()}`;

  const [selectedState, setSelectedState] = useState<string>("all");

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <Header color="black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[120px] md:pt-[100px] ">
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

            <div className="flex flex-wrap gap-3">
              <Select
                name="type"
                onValueChange={(value) =>
                  setSearchQuery((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyType.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ✅ Budget */}

              {/* ✅ State */}
              <Select
                name="state"
                onValueChange={(value) => {
                  setSelectedState(value);
                  setSearchQuery((prev) => ({
                    ...prev,
                    state: value,
                    lga: "all",
                  }));
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any State</SelectItem>
                  {Object.keys(statesAndLGAs).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ✅ LGA (depends on selected state) */}
              <Select
                name="lga"
                onValueChange={(value) =>
                  setSearchQuery((prev) => ({ ...prev, lga: value }))
                }
                disabled={selectedState === "all"}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="LGA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any LGA</SelectItem>
                  {selectedState !== "all" &&
                    statesAndLGAs[selectedState]?.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value: string) => {
                  console.log(value);
                  let range = value.split("-");
                  setSearchQuery((prev) => ({
                    ...prev,
                    min: Number(range[0]),
                    max: Number(range[1]),
                  }));
                  console.log(searchQuery.max, searchQuery.min);
                }}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>budget</SelectContent>
                <SelectContent>
                  {priceRanges.map((range) => {
                    return (
                      <SelectItem value={`${range.min}-${range.max}`}>
                        {range.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
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
        {loading && (
          <div className="flex justify-center items-center mb-4">
            <Spinner className="size-6 text-gray-400 animate-spin" />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <NoResults />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                favorites={favorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

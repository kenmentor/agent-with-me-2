"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, CheckCircle2, Bed, Bath, Square, MapPin, LayoutGrid, Images, Search, X, SlidersHorizontal, ChevronDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { priceRanges, propertyType, statesAndLGAs } from "@/app/data";
import { getDisplayName } from "@/lib/utils";

interface Property {
  _id: string;
  title: string;
  thumbnail: string;
  gallery?: { src: string; alt: string }[];
  location: string;
  price: string | number;
  bedrooms: number;
  bathrooms: number;
  area: string;
  type: string;
  category?: string;
  state?: string;
  lga?: string;
  verified: boolean;
  host?: { _id: string; userName: string; firstName?: string; lastName?: string; avatar?: string } | string;
  agentId?: string;
  agent?: { _id: string; userName: string; firstName?: string; lastName?: string; avatar?: string };
  description?: string;
  furnished?: boolean;
  electricity?: number;
  waterSuply?: boolean;
  [key: string]: any;
}

import api, { baseURL } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface PropertyFeedProps {
  properties: Property[];
  favorites?: string[];
  onLike?: (id: string) => void;
  onClose?: () => void;
  onFilter?: (filters: FeedFilters) => void;
}

export interface FeedFilters {
  search: string;
  type: string;
  category: string;
  state: string;
  lga: string;
  priceRange: [number, number];
  bedrooms: string;
}

export default function PropertyFeed({ properties, favorites: favoritesProp, onLike, onClose }: PropertyFeedProps) {
  const router = useRouter();
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set(favoritesProp || []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const { user, isAuthenticated } = useAuthStore();
  const [favoritesLoaded, setFavoritesLoaded] = useState(!!favoritesProp);
  
  const [filters, setFilters] = useState<FeedFilters>({
    search: "",
    type: "",
    category: "",
    state: "",
    lga: "",
    priceRange: [0, 100000000],
    bedrooms: "",
  });

  const [selectedState, setSelectedState] = useState("all");

  useEffect(() => {
    if (favoritesProp && favoritesProp.length > 0 && !favoritesLoaded) {
      setLikedProperties(new Set(favoritesProp));
      setFavoritesLoaded(true);
    } else if (isAuthenticated && user?._id && !favoritesLoaded && !favoritesProp) {
      api.get(`${baseURL}/v1/favorites/${user._id}`)
        .then((res) => {
          const favIds = res.data?.data?.map((fav: any) => fav.houseId?._id || fav.houseId) || [];
          setLikedProperties(new Set(favIds));
          setFavoritesLoaded(true);
        })
        .catch(() => setFavoritesLoaded(true));
    }
  }, [isAuthenticated, user?._id, favoritesLoaded, favoritesProp]);

  // Advanced filter function
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(searchLower);
        const matchLocation = p.location?.toLowerCase().includes(searchLower);
        const matchAddress = p.address?.toLowerCase().includes(searchLower);
        if (!matchTitle && !matchLocation && !matchAddress) return false;
      }
      
      // Type filter
      if (filters.type && filters.type !== "all" && p.type !== filters.type) return false;
      
      // Category filter
      if (filters.category && filters.category !== "all" && p.category !== filters.category) return false;
      
      // State filter
      if (filters.state && filters.state !== "all" && p.state !== filters.state) return false;
      
      // LGA filter
      if (filters.lga && filters.lga !== "all" && p.lga !== filters.lga) return false;
      
      // Bedrooms filter
      if (filters.bedrooms && filters.bedrooms !== "any" && p.bedrooms?.toString() !== filters.bedrooms) return false;
      
      // Price filter
      const price = typeof p.price === "string" ? parseFloat(p.price) : p.price;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      
      return true;
    });
  }, [properties, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const updateFilter = (key: keyof FeedFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === "state") {
      setSelectedState(value);
      if (value !== "all") {
        setFilters(prev => ({ ...prev, lga: "" }));
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      category: "",
      state: "",
      lga: "",
      priceRange: [0, 100000000],
      bedrooms: "",
    });
    setSelectedState("all");
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === "priceRange") return val[0] > 0 || val[1] < 100000000;
    if (key === "search") return val !== "";
    return val !== "" && val !== "all" && val !== "any";
  }).length;

  const handleLike = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (!isAuthenticated || !user?._id) {
      toast.error("Please login to like properties");
      return;
    }

// console.log("Like request:", { userId: user._id, houseId: id });

    try {
      const res = await api.post(`${baseURL}/v1/favorites/toggle`, {
        userId: user._id,
        houseId: id,
      });
      
// console.log("Favorite toggle response:", res.data);
      
      setLikedProperties(prev => {
        const newSet = new Set(prev);
        const message = res.data?.message || "";
        if (message.includes("Removed")) {
          newSet.delete(id);
          toast.success("Removed from liked");
        } else {
          newSet.add(id);
          toast.success("Added to liked!");
        }
        return newSet;
      });
      onLike?.(id);
    } catch (error: any) {
// console.error("Error toggling like:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to update like");
    }
  }, [isAuthenticated, user?._id, onLike]);

  const handleShare = useCallback((e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/properties/${property._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  }, []);

  const handleChat = useCallback((e: React.MouseEvent, agentId: string, propertyId?: string) => {
    e.stopPropagation();
    if (propertyId) {
      router.push(`/chat/${agentId}/${propertyId}`);
    } else {
      router.push(`/chat/${agentId}`);
    }
  }, [router]);

  const handleCardClick = useCallback((propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  }, [router]);

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
    return `₦${num.toLocaleString()}`;
  };

  const getAgentInfo = (property: Property) => {
    if (property.agent && typeof property.agent === 'object') {
      return { id: property.agent._id, name: getDisplayName(property.agent) || property.agent.userName, propertyId: property._id };
    }
    if (property.host && typeof property.host === 'object') {
      return { id: property.host._id, name: getDisplayName(property.host) || property.host.userName, propertyId: property._id };
    }
    return { id: property.agentId || "", name: typeof property.host === 'string' ? property.host : "", propertyId: property._id };
  };

  const scrollToIndex = (index: number) => {
    if (containerRef.current && index >= 0 && index < properties.length) {
      const itemHeight = window.innerHeight;
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-white mb-2">No properties</h2>
        <p className="text-gray-500 mb-6">Try adjusting filters</p>
        <button 
          onClick={onClose} 
          className="px-6 py-3 bg-white text-black rounded-full font-semibold flex items-center gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          Back to Grid
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Header with Search & Filters */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white text-black rounded-full font-semibold flex items-center gap-2 text-sm shrink-0"
          >
            <LayoutGrid className="w-4 h-4" />
            Grid
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search properties..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 h-10"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-full font-semibold flex items-center gap-2 text-sm shrink-0 ${showFilters ? "bg-white text-black" : "bg-white/10 text-white"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        
        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Filters</h4>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-white/60 text-sm hover:text-white"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-white/70 text-xs">Listing Type</label>
              <div className="flex gap-2">
                {["all", "rent", "sale"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFilter("type", type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filters.type === type || (type === "all" && !filters.type) ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
                  >
                    {type === "all" ? "All" : type === "rent" ? "Rent" : "Sale"}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-white/70 text-xs">Property Type</label>
              <Select value={filters.category} onValueChange={(v) => updateFilter("category", v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyType.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State & LGA */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-white/70 text-xs">State</label>
                <Select value={filters.state} onValueChange={(v) => updateFilter("state", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Any State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any State</SelectItem>
                    {Object.keys(statesAndLGAs).map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-white/70 text-xs">LGA</label>
                <Select 
                  value={filters.lga} 
                  onValueChange={(v) => updateFilter("lga", v)}
                  disabled={filters.state === "all" || !filters.state}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Any LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any LGA</SelectItem>
                    {filters.state !== "all" && statesAndLGAs[filters.state as keyof typeof statesAndLGAs]?.map((lga) => (
                      <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="text-white/70 text-xs">Bedrooms</label>
              <Select value={filters.bedrooms} onValueChange={(v) => updateFilter("bedrooms", v)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1 Room</SelectItem>
                  <SelectItem value="2">2 Rooms</SelectItem>
                  <SelectItem value="3">3 Rooms</SelectItem>
                  <SelectItem value="4">4 Rooms</SelectItem>
                  <SelectItem value="5">5+ Rooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

{/* Price Range */}
            <div className="space-y-2">
              <label className="text-white/70 text-xs">Price Range</label>
              <Select 
                value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
                onValueChange={(v) => {
                  const [min, max] = v.split("-").map(Number);
                  setFilters(prev => ({ ...prev, priceRange: [min, max] }));
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100000000">Any Price</SelectItem>
                  {priceRanges.slice(1).map((range, idx) => (
                    <SelectItem key={idx} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-white/60 text-xs pt-2 border-t border-white/10">
              Showing {filteredProperties.length} of {properties.length} properties
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-end">
          <span className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
            {currentIndex + 1} / {filteredProperties.length}
          </span>
        </div>
      </div>

      {/* Vertical Scroll Container */}
      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory"
        style={{
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          const itemHeight = window.innerHeight;
          const newIndex = Math.round(scrollTop / itemHeight);
          setCurrentIndex(Math.min(newIndex, filteredProperties.length - 1));
        }}
      >
        {filteredProperties.map((property, index) => {
          const agentInfo = getAgentInfo(property);
          const images = property.gallery?.length
            ? [property.thumbnail, ...property.gallery.map(g => g.src)]
            : [property.thumbnail];
          
          const currentImgIdx = currentImageIndex[property._id] || 0;

          const handleTouchStart = (e: React.TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
          };

          const handleTouchEnd = (e: React.TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX.current - touchEndX;
            
            if (Math.abs(diff) > 50) {
              if (diff > 0 && currentImgIdx < images.length - 1) {
                setCurrentImageIndex(prev => ({ ...prev, [property._id]: currentImgIdx + 1 }));
              } else if (diff < 0 && currentImgIdx > 0) {
                setCurrentImageIndex(prev => ({ ...prev, [property._id]: currentImgIdx - 1 }));
              }
            }
          };

          return (
            <div
              key={property._id}
              className="h-screen w-screen snap-center snap-always relative flex-shrink-0"
              onClick={() => handleCardClick(property._id)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Property Image - Full Screen with fit */}
              <div className="absolute inset-0">
                <img
                  src={images[currentImgIdx] || "/placeholder.jpg"}
                  alt={`${property.title} - Image ${currentImgIdx + 1}`}
                  className="w-full h-full object-contain"
                  style={{ backgroundColor: '#1a1a1a' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>

              {/* Previous Image Button */}
              {images.length > 1 && currentImgIdx > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => ({ ...prev, [property._id]: currentImgIdx - 1 }));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Next Image Button */}
              {images.length > 1 && currentImgIdx < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => ({ ...prev, [property._id]: currentImgIdx + 1 }));
                  }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Verified Badge */}
              {property.verified && (
                <div className="absolute top-20 left-4 z-30">
                  <div className="bg-green-500 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-semibold">Verified</span>
                  </div>
                </div>
              )}

              {/* Image Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute top-20 right-4 z-30 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <span className="text-white text-xs font-medium">{currentImgIdx + 1}/{images.length}</span>
                </div>
              )}

              {/* Right Side Actions */}
              <div 
                className="absolute right-4 bottom-48 z-30 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleLike(e, property._id)}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all bg-white/10 backdrop-blur-md hover:bg-white/20"
                >
                  <Heart className={`w-5 h-5 ${likedProperties.has(property._id) ? "text-pink-500 fill-pink-500" : "text-white"}`} />
                </button>

                {agentInfo.id && (
                  <button
                    onClick={(e) => handleChat(e, agentInfo.id, agentInfo.propertyId)}
                    className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>
                )}

                <button
                  onClick={(e) => handleShare(e, property)}
                  className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 z-30 p-5 pb-12">
                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                    {property.type}
                  </span>
                  {property.furnished && (
                    <span className="bg-blue-500/80 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Furnished
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 
                  className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleCardClick(property._id); }}
                >
                  {property.title}
                </h2>

                {/* Location */}
                <div className="flex items-center gap-2 text-white/90 mb-3">
                  <MapPin className="w-4 h-4 text-white/70" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Quick Specs */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Square className="w-4 h-4" />
                    <span className="text-sm font-medium">{property.area}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-white/60 text-sm">/year</span>
                </div>

                {/* Swipe hint for multi-image */}
                {images.length > 1 && (
                  <p className="text-white/40 text-xs mt-2">Swipe left for more images</p>
                )}
                <p className="text-white/40 text-xs mt-1">Tap to see full details</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {properties.slice(0, 10).map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className={`w-1.5 rounded-full transition-all duration-200 ${
              idx === currentIndex ? "h-4 bg-white" : "h-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
        {properties.length > 10 && (
          <span className="text-white/60 text-xs text-center mt-1">+{properties.length - 10}</span>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black to-transparent">
        <button
          onClick={onClose}
          className="w-full py-3 bg-white text-black rounded-full font-semibold flex items-center justify-center gap-2"
        >
          <LayoutGrid className="w-5 h-5" />
          Back to Grid View
        </button>
      </div>
    </div>
  );
}

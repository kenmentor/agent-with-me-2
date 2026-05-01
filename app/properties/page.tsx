"use client";
import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, LayoutGrid, AlignVerticalJustifyCenter, Loader2 } from "lucide-react";

import Header from "@/components/Header";
import PropertyCard from "../../components/PropertyCard";
import PropertyFeed from "@/components/PropertyFeed";
import Req from "@/app/utility/axios";
import { priceRanges, propertyType, statesAndLGAs } from "../data";
import NoResults from "../../components/NoResults";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import PropertySkeleton from "@/components/PropertySkeleton";
import { useDebounce } from "@/lib/useDebounce";
import { useAuthStore } from "@/store/authStore";

function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header color="black" />
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Spinner className="size-8 animate-spin" />
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesContent />
    </Suspense>
  );
}

function PropertiesContent() {
  const { base, app } = Req;
  const { user, isAuthenticated } = useAuthStore();

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
    priceRange: [0, 0] as [number, number],
  });

  // Debounced keyword for search
  const debouncedKeyword = useDebounce(searchQuery.keyword, 300);
  
  const [viewMode, setViewMode] = useState<"grid" | "feed">("grid");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{text: string; type: string}[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce suggestion query
  useEffect(() => {
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    if (!suggestionQuery || suggestionQuery.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(suggestionQuery);
    }, 300);
    return () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, [suggestionQuery]);

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("propertyViewMode");
    if (saved === "grid" || saved === "feed") {
      setViewMode(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("propertyViewMode", viewMode);
  }, [viewMode]);

  function buildHouseUrl(base: string, searchQuery: any, keyword: string) {
    const params: Record<string, string> = {};

    const addParam = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "" && value !== "all") {
        params[key] = String(value);
      }
    };

    if (Array.isArray(searchQuery?.priceRange)) {
      if (searchQuery.priceRange[0]) addParam("min", searchQuery.priceRange[0]);
      if (searchQuery.priceRange[1]) addParam("max", searchQuery.priceRange[1]);
    }

    addParam("type", searchQuery?.type);
    addParam("category", searchQuery?.category);
    if (keyword) addParam("searchWord", keyword);
    addParam("limit", searchQuery?.limit || "50");
    addParam("lga", searchQuery?.lga);
    addParam("state", searchQuery?.state);
    addParam("landmark", searchQuery?.landmark);

    const queryString = new URLSearchParams(params).toString();
    return `${base}/v1/house${queryString ? `?${queryString}` : ""}`;
  }

  // Fetch suggestions for autocomplete
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setSuggestionsLoading(true);
    try {
      const res = await app.get(`${base}/v1/house?searchWord=${encodeURIComponent(query)}&limit=3`);
      const properties = res.data?.data || [];
      
      const newSuggestions: {text: string; type: string}[] = [];
      const addedTexts = new Set<string>();
      
      properties.forEach((p: any) => {
        if (p.title && !addedTexts.has(p.title)) {
          newSuggestions.push({ text: p.title, type: 'title' });
          addedTexts.add(p.title);
        }
        if (p.location && !addedTexts.has(p.location)) {
          newSuggestions.push({ text: p.location, type: 'location' });
          addedTexts.add(p.location);
        }
        if (p.address && !addedTexts.has(p.address)) {
          newSuggestions.push({ text: p.address, type: 'address' });
          addedTexts.add(p.address);
        }
      });
      
      setSuggestions(newSuggestions.slice(0, 6));
    } catch (error) {
// console.error("Error fetching suggestions:", error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [app, base]);

  // Handle search input change with suggestions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery((prev) => ({ ...prev, keyword: value }));
    setShowSuggestions(true);
    setSuggestionQuery(value);
  };

  // Trigger immediate search (no debounce for suggestions)
  const triggerSearch = () => {
    setPage(1);
    setHasMore(true);
    setData([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setSearchQuery((prev) => ({ ...prev, keyword: text }));
    setShowSuggestions(false);
    setSuggestions([]);
    setSuggestionQuery("");
    // Trigger search immediately without debounce
    triggerSearch();
  };

  useEffect(() => {
    // Reset and fetch first page when filters change
    setPage(1);
    setHasMore(true);
    setData([]);
    
    const finalUrl = buildHouseUrl(base, searchQuery, debouncedKeyword) + `&page=1`;
// console.log("Fetching:", finalUrl);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
// console.log("Search keyword:", debouncedKeyword);
        const res = (await app.get(finalUrl)).data;
// console.log("Results:", res.data?.length);
        setData(res.data || []);
        setHasMore(res.data?.length >= 20);
      } catch (err) {
// console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedKeyword, searchQuery.type, searchQuery.category, searchQuery.lga, searchQuery.state, searchQuery.landmark, searchQuery.priceRange, app, base]);

  // Load more function
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    const nextPage = page + 1;
    const finalUrl = buildHouseUrl(base, searchQuery, debouncedKeyword) + `&page=${nextPage}`;
// console.log("Loading more:", finalUrl);
    
    setLoadingMore(true);
    try {
      const res = (await app.get(finalUrl)).data;
      const newData = res.data || [];
      if (newData.length > 0) {
        setData(prev => [...prev, ...newData]);
        setPage(nextPage);
        setHasMore(newData.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
// console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollGuardRef = useRef(false);

  // Infinite scroll handler with proper guard
  useEffect(() => {
    const handleScroll = () => {
      if (scrollGuardRef.current || loadingMore || !hasMore) return;
      
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 500;
      
      if (scrollPosition >= threshold) {
        scrollGuardRef.current = true;
        loadMore().finally(() => {
          setTimeout(() => { scrollGuardRef.current = false; }, 500);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  const toggleFavorite = async (propertyId: string) => {
    if (!isAuthenticated || !user?._id) {
      toast.error("Please login to save properties");
      return;
    }

    try {
      await app.post(`${base}/v1/favorites/toggle`, {
        userId: user._id,
        houseId: propertyId,
      });
      
      setFavorites((prev) =>
        prev.includes(propertyId)
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId]
      );
    } catch (error) {
// console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  // Fetch user favorites on mount
  useEffect(() => {
// console.log("Fetching favorites for user:", user?._id);
    if (isAuthenticated && user?._id) {
      app.get(`${base}/v1/favorites/${user._id}`)
        .then((res) => {
          const favIds = res.data?.data?.map((fav: any) => fav.houseId?._id || fav.houseId) || [];
          setFavorites(favIds);
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user?._id, app, base]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header color="black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[120px] md:pt-[100px]">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location, property type, or area..."
                  value={searchQuery.keyword}
                  name="keyword"
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && suggestions.length > 0) {
                      handleSuggestionClick(suggestions[0].text);
                    }
                  }}
                  className="pl-10"
                />
                {suggestionsLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                      >
                        <span>{suggestion.text}</span>
                        <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                  let range = value.split("-");
                  setSearchQuery((prev) => ({
                    ...prev,
                    min: Number(range[0]),
                    max: Number(range[1]),
                  }));
                }}
              >
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem
                      value={`${range.min}-${range.max}`}
                      key={range.label}
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Properties for You</h1>
            <p className="text-gray-600">{data?.length} properties found</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "feed" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("feed")}
            >
              <AlignVerticalJustifyCenter className="h-4 w-4 mr-2" />
              Feed
            </Button>
          </div>
        </div>

        {viewMode === "feed" ? (
          <PropertyFeed
            properties={data as any}
            favorites={favorites}
            onLike={toggleFavorite}
            onClose={() => setViewMode("grid")}
          />
        ) : (
          <>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-[100px]">
                {data.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property as any}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


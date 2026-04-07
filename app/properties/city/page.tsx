"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, Navigation, Loader2, Home, CheckCircle2, X, Search, 
  List, Map as MapIcon, ChevronDown, Filter, Bed, Bath, Square
} from "lucide-react";
import Header from "@/components/Header";
import Req from "@/app/utility/axois";
import { statesAndLGAs } from "../../data";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

const { base, app } = Req;

function CityPropertiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header color="black" />
      <div className="flex items-center justify-center h-[calc(100vh-60px)] pt-[60px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    </div>
  );
}

interface Property {
  _id: string;
  title: string;
  thumbnail: string;
  location: string;
  price: number | string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  verified: boolean;
  type?: string;
  host?: { _id: string; userName: string };
  coordinates?: { lat: number; lng: number };
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function CityPropertiesPage() {
  return (
    <Suspense fallback={<CityPropertiesLoading />}>
      <CityPropertiesContent />
    </Suspense>
  );
}

function CityPropertiesContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const nigerianCities: Record<string, { lat: number; lng: number }> = {
    "Lagos": { lat: 6.5244, lng: 3.3792 },
    "Abuja": { lat: 9.0765, lng: 7.3986 },
    "Port Harcourt": { lat: 4.7774, lng: 7.0134 },
    "Kano": { lat: 12.0022, lng: 8.5920 },
    "Ibadan": { lat: 7.3775, lng: 3.9470 },
    "Benin City": { lat: 6.3350, lng: 5.6037 },
    "Calabar": { lat: 4.9517, lng: 8.3022 },
    "Enugu": { lat: 6.4516, lng: 7.5452 },
    "Aba": { lat: 5.1066, lng: 7.3667 },
    "Maiduguri": { lat: 11.8333, lng: 13.1500 },
  };

  const defaultCenter = selectedState && nigerianCities[selectedState] 
    ? nigerianCities[selectedState] 
    : { lat: 9.0765, lng: 7.3986 };

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
          toast.success("Location detected!");
        },
        (error) => {
          console.error("Location error:", error);
          setLocationLoading(false);
          toast.error("Could not get your location. Showing all properties.");
        }
      );
    }
  };

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${base}/v1/house?limit=100`;
      
      if (selectedState) {
        url += `&state=${encodeURIComponent(selectedState)}`;
      }
      if (selectedCity) {
        url += `&lga=${encodeURIComponent(selectedCity)}`;
      }
      if (searchQuery) {
        url += `&searchWord=${encodeURIComponent(searchQuery)}`;
      }

      const res = await app.get(url);
      let data = res.data?.data || [];
      
      if (userLocation) {
        data = data.sort((a: Property, b: Property) => {
          const distA = calculateDistance(userLocation.lat, userLocation.lng, a.coordinates?.lat || 0, a.coordinates?.lng || 0);
          const distB = calculateDistance(userLocation.lat, userLocation.lng, b.coordinates?.lat || 0, b.coordinates?.lng || 0);
          return distA - distB;
        });
      }
      
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  }, [app, base, selectedState, selectedCity, searchQuery, userLocation]);

  useEffect(() => {
    if (mounted) {
      fetchProperties();
    }
  }, [mounted, fetchProperties]);

  useEffect(() => {
    if (selectedState && nigerianCities[selectedState] && mapInstance) {
      mapInstance.flyTo([nigerianCities[selectedState].lat, nigerianCities[selectedState].lng], 12, {
        duration: 1.5
      });
    }
  }, [selectedState, mapInstance]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    if (!lat2 || !lng2) return Infinity;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
    return `₦${num.toLocaleString()}`;
  };

  const mapCenter = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng] as [number, number];
    return [defaultCenter.lat, defaultCenter.lng] as [number, number];
  }, [userLocation, defaultCenter]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header color="black" />
        <div className="flex items-center justify-center h-[calc(100vh-60px)] pt-[60px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-[60px] bg-gray-100">
      <Header color="black" />
      
      {/* Top Search Bar */}
      <div className="absolute top-[60px] left-0 right-0 z-[1000] bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* State Select */}
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statesAndLGAs).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City/LGA Select */}
            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="City/LGA" />
              </SelectTrigger>
              <SelectContent>
                {selectedState && statesAndLGAs[selectedState]?.map((lga) => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Button */}
            <Button
              variant={userLocation ? "default" : "outline"}
              onClick={requestLocation}
              disabled={locationLoading}
              className="w-full md:w-auto"
            >
              {locationLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {userLocation ? "Location On" : "My Location"}
            </Button>

            {/* View Toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-2 ${viewMode === "map" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
              >
                <MapIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "map" ? (
        <div className="h-full pt-[120px]">
          {/* Map */}
          <MapContainer
            center={mapCenter}
            zoom={selectedState ? 12 : 6}
            className="h-full w-full"
            whenReady={() => setMapReady(true)}
            ref={(map: any) => {
              if (map) setMapInstance(map);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            {userLocation && mapReady && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Your Location</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Property Markers */}
            {properties.map((property) => {
              if (!property.coordinates?.lat || !property.coordinates?.lng) return null;
              
              return (
                <Marker
                  key={property._id}
                  position={[property.coordinates.lat, property.coordinates.lng]}
                  eventHandlers={{
                    click: () => setSelectedProperty(property),
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <img
                        src={property.thumbnail || "/placeholder.jpg"}
                        alt={property.title}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {property.location}
                      </p>
                      <p className="font-bold text-blue-600 mt-1">{formatPrice(property.price)}/yr</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Selected Property Card */}
          {selectedProperty && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000]">
              <Card className="shadow-xl">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={selectedProperty.verified ? "default" : "secondary"} className={selectedProperty.verified ? "bg-green-500" : ""}>
                      {selectedProperty.verified ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                      {selectedProperty.verified ? "Verified" : "Pending"}
                    </Badge>
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-3 mb-3">
                    <img
                      src={selectedProperty.thumbnail || "/placeholder.jpg"}
                      alt={selectedProperty.title}
                      className="w-24 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-2">{selectedProperty.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {selectedProperty.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {selectedProperty.bedrooms} Beds</span>
                    <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {selectedProperty.bathrooms} Baths</span>
                    <span className="flex items-center gap-1"><Square className="h-4 w-4" /> {selectedProperty.area}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-blue-600">{formatPrice(selectedProperty.price)}<span className="text-sm text-gray-500 font-normal">/yr</span></p>
                    <Button 
                      size="sm" 
                      onClick={() => router.push(`/properties/${selectedProperty._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Properties Count */}
          <div className="absolute top-[130px] left-4 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow">
              <p className="text-sm font-medium">{properties.length} properties found</p>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="h-full pt-[120px] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : properties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No properties found</h3>
                  <p className="text-gray-500">Try selecting a different location</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card 
                    key={property._id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/properties/${property._id}`)}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={property.thumbnail || "/placeholder.jpg"}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        {property.verified && (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        )}
                        {property.type && (
                          <Badge variant="secondary">{property.type}</Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-1">{property.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" /> {property.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms}</span>
                        <span className="flex items-center gap-1"><Square className="h-4 w-4" /> {property.area}</span>
                      </div>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(property.price)}<span className="text-sm text-gray-500 font-normal">/yr</span></p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

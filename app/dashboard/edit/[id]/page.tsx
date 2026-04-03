"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { toast } from "sonner";
import { propertyType, statesAndLGAs } from "@/app/data";

const { base, app } = Req;

interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price: string;
  address: string;
  state: string;
  lga: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  furnishing: string;
  amenities: string[];
  verified: boolean;
  host?: { _id: string; userName: string };
}

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    price: "",
    address: "",
    state: "",
    lga: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    furnishing: "unfurnished",
    amenities: [] as string[],
    terms: "",
  });

  const amenitiesList = [
    "WiFi",
    "Parking",
    "Security",
    "Pool",
    "Gym",
    "Air Conditioning",
    "Furnished",
    "Pet Friendly",
    "Generator",
    "Water",
  ];

  useEffect(() => {
    if (!_hasHydrated) return;
    
    const fetchProperty = async () => {
      if (!propertyId) return;
      
      try {
        setLoading(true);
        const res = await app.get(`${base}/v1/house/${propertyId}`);
        const data = res.data?.data;
        
        if (data) {
          setProperty(data);
          
          if (data.host?._id === user?._id || user?.role === "agent") {
            setAuthorized(true);
          } else {
            toast.error("You are not authorized to edit this property");
            router.push("/dashboard");
            return;
          }
          
          setFormData({
            title: data.title || "",
            description: data.description || "",
            type: data.type || "",
            category: data.category || "",
            price: data.price?.toString() || "",
            address: data.address || "",
            state: data.state || "",
            lga: data.lga || "",
            bedrooms: data.bedrooms?.toString() || "",
            bathrooms: data.bathrooms?.toString() || "",
            area: data.area || "",
            furnishing: data.furnishing || "unfurnished",
            amenities: data.amenities || [],
            terms: data.terms || "",
          });
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        toast.error("Property not found");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [_hasHydrated, propertyId, app, base, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
      };

      const res = await app.put(`${base}/v1/house/${propertyId}`, payload);

      if (res.data?.ok || res.status === 200) {
        toast.success("Property updated successfully!");
        router.push("/dashboard");
      } else {
        toast.error(res.data?.message || "Failed to update property");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header color="black" />

      <div className="max-w-3xl mx-auto px-4 py-8 pt-[120px] md:pt-[100px]">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Property</CardTitle>
            <CardDescription>
              Update your property details
            </CardDescription>
            {property?.verified && (
              <div className="mt-2 flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span className="text-sm">Verified Property</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyType.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="shortlet">Shortlet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData((p) => ({ ...p, state: v, lga: "" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(statesAndLGAs).map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>LGA</Label>
                  <Select value={formData.lga} onValueChange={(v) => setFormData((p) => ({ ...p, lga: v }))} disabled={!formData.state}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.state &&
                        statesAndLGAs[formData.state]?.map((lga) => (
                          <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Property Amenities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter rental terms and conditions..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

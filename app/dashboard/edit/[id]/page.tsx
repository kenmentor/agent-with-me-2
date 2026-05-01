"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  Trash2,
  Upload,
  X,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axios";
import { toast } from "sonner";
import { propertyType, statesAndLGAs, amenitiesList } from "@/app/data";
import { isRole, getDashboardRoute } from "@/lib/roles";

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
  terms?: string;
  verified: boolean;
  status?: string;
  thumbnail?: string;
  images?: string[];
  video?: string;
  host?: { _id: string; userName: string };
}

const STEPS = [
  { id: 1, name: "Basic Info", fields: ["title", "type", "category", "price"] },
  { id: 2, name: "Location", fields: ["state", "lga", "address"] },
  { id: 3, name: "Details", fields: ["bedroom", "bathroom", "area", "furnishing"] },
  { id: 4, name: "Media", fields: ["images"] },
  { id: 5, name: "Review", fields: [] },
];

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    images: [] as string[],
    newImages: [] as File[],
    video: "",
    thumbnail: "",
  });

  const totalSteps = STEPS.length;

  useEffect(() => {
    if (!_hasHydrated) return;
    
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    
    if (!isRole(["landlord", "host", "agent"])) {
      toast.error("Access denied. Only landlords and agents can edit properties.");
      router.replace(getDashboardRoute());
      return;
    }
    
    const fetchProperty = async () => {
      if (!propertyId) return;
      
      try {
        setLoading(true);
        const res = await app.get(`${base}/v1/house/${propertyId}`);
        const data = res.data?.data;
        
        if (data) {
          setProperty(data);
          
          const isOwner = data.host?._id === user?._id;
          const isAgent = user?.role === "agent";
          
          if (!isOwner && !isAgent) {
            toast.error("You are not authorized to edit this property");
            router.push("/dashboard");
            return;
          }
          
          setAuthorized(true);
          setFormData({
            title: data.title || "",
            description: data.description || "",
            type: data.type || "",
            category: data.category || "",
            price: data.price?.toString() || "",
            address: data.address || "",
            state: data.state || "",
            lga: data.lga || "",
            bedrooms: data.bedroom?.toString() || "",
            bathrooms: data.bathroom?.toString() || "",
            area: data.area || "",
            furnishing: data.furnishing || "unfurnished",
            amenities: data.amenities || [],
            terms: data.terms || "",
            images: data.images || [],
            newImages: [],
            video: data.video || "",
            thumbnail: data.thumbnail || "",
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
  }, [_hasHydrated, propertyId, app, base, user, router, isAuthenticated]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        continue;
      }
      newImages.push(files[i]);
    }
    
    if (newImages.length > 0) {
      setFormData((prev) => ({ ...prev, newImages: [...prev.newImages, ...newImages] }));
    }
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
  };

  const setThumbnail = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
    toast.success("Thumbnail updated!");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.type && formData.price);
      case 2:
        return !!(formData.state && formData.lga);
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in required fields");
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error("Please complete all required fields");
      return;
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("type", formData.type);
      data.append("category", formData.category);
      data.append("price", formData.price.toString());
      data.append("address", formData.address);
      data.append("state", formData.state);
      data.append("lga", formData.lga);
      data.append("bedroom", formData.bedrooms.toString());
      data.append("bathroom", formData.bathrooms.toString());
      data.append("furnishing", formData.furnishing);

      // Set agent field to current user (for agents editing properties)
      if (user?._id) {
        data.append("agent", user._id);
      }

      formData.amenities.forEach((amenity) => {
        data.append("amenities[]", amenity);
      });

      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }
      
      formData.images.forEach((url) => {
        data.append("existingImages[]", url);
      });

      formData.newImages.forEach((file) => {
        data.append("files", file);
      });

      setUploadProgress(0);
      
      const res = await app.put(`${base}/v1/house/${propertyId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(Math.min(percent, 95));
        },
      });

      setUploadProgress(100);

      if (res.data?.ok || res.status === 200) {
        toast.success("Property updated successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        toast.error(res.data?.message || "Failed to update property");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update property");
    } finally {
      setSaving(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header color="black" />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header color="black" />

      <div className="max-w-4xl mx-auto px-4 py-8 pt-[120px] md:pt-[100px]">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}: {STEPS[currentStep - 1].name}</p>
        </div>

        <Progress value={(currentStep / totalSteps) * 100} className="mb-8" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
                <CardDescription>
                  {currentStep === 5 ? "Review and save your changes" : "Fill in the property details"}
                </CardDescription>
              </div>
              {property?.verified && (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Verified</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Luxury 3 Bedroom Flat in Lekki"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type *</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyType.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData((p) => ({ ...p, state: v, lga: "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statesAndLGAs).map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>LGA *</Label>
                    <Select value={formData.lga} onValueChange={(v) => setFormData((p) => ({ ...p, lga: v }))} disabled={!formData.state}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.state && statesAndLGAs[formData.state]?.map((lga) => (
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
                    placeholder="Enter detailed address"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="e.g., 3"
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
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="e.g., 1200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Furnishing</Label>
                  <Select value={formData.furnishing} onValueChange={(v) => setFormData((p) => ({ ...p, furnishing: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your property..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={formData.amenities.includes(amenity.id)}
                          onCheckedChange={() => handleAmenityToggle(amenity.id)}
                        />
                        <Label htmlFor={`amenity-${amenity.id}`} className="text-sm cursor-pointer">
                          {amenity.label}
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
                    placeholder="Enter rental terms..."
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Property Images</Label>
                  
                  {formData.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Current Images ({formData.images.length})</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={url}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              onClick={() => removeExistingImage(url)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {formData.thumbnail === url && (
                              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                                Thumbnail
                              </span>
                            )}
                            {formData.thumbnail !== url && (
                              <button
                                onClick={() => setThumbnail(url)}
                                className="absolute bottom-1 left-1 px-2 py-0.5 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Set Thumbnail
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload new images</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
                    </label>
                  </div>

                  {formData.newImages.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">New Images ({formData.newImages.length})</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {formData.newImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`New ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video">Video URL (YouTube or Vimeo)</Label>
                  <Input
                    id="video"
                    name="video"
                    value={formData.video}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    {formData.thumbnail && (
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={formData.thumbnail}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">{formData.title || "Untitled Property"}</h3>
                      <p className="text-gray-600">
                        {formData.type} - {formData.category}
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        ₦{Number(formData.price).toLocaleString()}
                        {formData.category === "rent" && "/year"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{formData.address}, {formData.lga}, {formData.state}</span>
                    </div>
                    <div className="flex gap-4 text-gray-600">
                      {formData.bedrooms && <span>{formData.bedrooms} beds</span>}
                      {formData.bathrooms && <span>{formData.bathrooms} baths</span>}
                      {formData.area && <span>{formData.area} sqft</span>}
                    </div>
                  </div>

                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity) => (
                        <span key={amenity} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className="text-sm">
                      {formData.images.length} existing images
                    </span>
                    {formData.newImages.length > 0 && (
                      <span className="text-sm text-green-600">
                        + {formData.newImages.length} new images
                      </span>
                    )}
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} />
                )}
              </div>
            )}

            <div className="flex justify-between gap-4 pt-6 border-t mt-6">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saving}>
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  Trash2,
  Upload,
  X,
  Camera,
  Video,
  Bed,
  Bath,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axios";
import { toast } from "sonner";
import { propertyType, statesAndLGAs, amenitiesList } from "@/app/data";
import { isRole, getDashboardRoute } from "@/lib/roles";

const { base, app } = Req;

const STEPS = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Location" },
  { id: 3, name: "Details" },
  { id: 4, name: "Photos & Publish" },
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
    furnishing: "",
    amenities: [] as string[],
    images: [] as string[],
    newImages: [] as File[],
    video: "",
    newVideo: null as File | null,
    thumbnail: "",
  });

  const [selectedState, setSelectedState] = useState<string>("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        const res = await app.get(`${base}/v1/house/detail/${propertyId}`);
        const data = res.data?.data;
        
        if (data) {
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
            bedrooms: data.bedrooms?.toString() || "",
            bathrooms: data.bathrooms?.toString() || "",
            furnishing: data.furnishing || "",
            amenities: data.amenities || [],
            images: data.images?.map((img: { url: string }) => img.url) || [],
            newImages: [],
            video: data.video || "",
            newVideo: null,
            thumbnail: data.thumbnail || "",
          });
          setSelectedState(data.state || "all");
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.type) newErrors.type = "Property type is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.price) newErrors.price = "Price is required";
    } else if (step === 2) {
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.lga) newErrors.lga = "LGA is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    } else if (step === 3) {
      if (!formData.bedrooms) newErrors.bedrooms = "Bedrooms is required";
      if (!formData.bathrooms) newErrors.bathrooms = "Bathrooms is required";
      if (!formData.furnishing) newErrors.furnishing = "Furnishing status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((id) => id !== amenityId),
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        newImages: [...prev.newImages, ...newImages].slice(0, 10),
      }));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size must be less than 50MB");
      return;
    }
    setFormData((prev) => ({ ...prev, newVideo: file }));
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

  const handleThumbnailSelect = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
    toast.success("Thumbnail updated!");
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
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
      data.append("bedroom", formData.bedrooms);
      data.append("bathroom", formData.bathrooms);
      data.append("furnishing", formData.furnishing);
      data.append("location", `${formData.address}, ${formData.lga}, ${formData.state}`);

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

      if (formData.newVideo) {
        data.append("video", formData.newVideo);
      }

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
          <p className="text-gray-600">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`p-3 rounded-full flex items-center justify-center font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-full h-1 mx-4 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Location</span>
            <span>Details</span>
            <span>Photos & Publish</span>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Listing Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}
                    >
                      <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="What do you want to do?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent Out</SelectItem>
                        <SelectItem value="sale">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Property Type *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyType.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Property Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., 2BHK Apartment in Bandra West with Sea View"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    rows={4}
                    placeholder="Describe your property, its features, nearby amenities..."
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    placeholder="Enter price"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(v) => {
                        setSelectedState(v);
                        setFormData((p) => ({ ...p, state: v, lga: "all" }));
                      }}
                    >
                      <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statesAndLGAs).map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>LGA *</Label>
                    <Select
                      value={formData.lga}
                      onValueChange={(v) => setFormData((p) => ({ ...p, lga: v }))}
                      disabled={selectedState === "all"}
                    >
                      <SelectTrigger className={errors.lga ? "border-red-500" : ""}>
                        <SelectValue placeholder="LGA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any LGA</SelectItem>
                        {selectedState !== "all" &&
                          statesAndLGAs[selectedState]?.map((lga) => (
                            <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.lga && <p className="text-sm text-red-500">{errors.lga}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Complete Address *</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    rows={3}
                    placeholder="Enter complete address with building name, street, and nearby landmarks"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bedrooms *</Label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Select
                        value={formData.bedrooms}
                        onValueChange={(v) => setFormData((p) => ({ ...p, bedrooms: v }))}
                      >
                        <SelectTrigger className={`pl-10 ${errors.bedrooms ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 room</SelectItem>
                          <SelectItem value="2">2 room</SelectItem>
                          <SelectItem value="3">3 room</SelectItem>
                          <SelectItem value="4">4 room</SelectItem>
                          <SelectItem value="5">5+ room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Bathrooms *</Label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Select
                        value={formData.bathrooms}
                        onValueChange={(v) => setFormData((p) => ({ ...p, bathrooms: v }))}
                      >
                        <SelectTrigger className={`pl-10 ${errors.bathrooms ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5+">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Furnishing Status *</Label>
                    <Select
                      value={formData.furnishing}
                      onValueChange={(v) => setFormData((p) => ({ ...p, furnishing: v }))}
                    >
                      <SelectTrigger className={errors.furnishing ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                        <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.furnishing && <p className="text-sm text-red-500">{errors.furnishing}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Amenities & Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={formData.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                        />
                        <Label htmlFor={`amenity-${amenity.id}`} className="flex items-center space-x-2 cursor-pointer">
                          <amenity.icon className="h-4 w-4" />
                          <span>{amenity.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Property Images</Label>
                  
                  {formData.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2 text-gray-700">
                        Current Images ({formData.images.length}/10):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((url, index) => (
                          <div
                            key={index}
                            className={`relative group ${
                              formData.thumbnail === url ? "border-4 border-blue-500" : ""
                            }`}
                          >
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
                              <Badge className="absolute bottom-1 left-1 text-xs">Thumbnail</Badge>
                            )}
                            {formData.thumbnail !== url && (
                              <button
                                onClick={() => handleThumbnailSelect(url)}
                                className="absolute bottom-1 right-1 p-1 bg-blue-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Set Thumbnail
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Label
                    htmlFor="image-upload"
                    className="block cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition-all border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 mb-2 font-medium">Upload additional photos (Max 10)</p>
                    <p className="text-sm text-gray-500 mb-4">JPG, PNG files up to 5MB each</p>
                    <Button type="button" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photos
                    </Button>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="image-upload"
                      className="hidden"
                    />
                  </Label>

                  {formData.newImages.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-700">
                        New Images ({formData.newImages.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => document.getElementById("video-upload")?.click()}
                >
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload property video</p>
                  <p className="text-sm text-gray-500 mb-4">MP4 files up to 50MB</p>
                  <Button type="button" variant="outline" className="cursor-pointer bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Video
                  </Button>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>

                {formData.newVideo && (
                  <div className="border rounded-lg overflow-hidden p-2">
                    <video src={URL.createObjectURL(formData.newVideo)} controls className="w-full rounded-lg max-h-64 object-cover" />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <p className="text-sm text-gray-500 truncate">{formData.newVideo.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData((p) => ({ ...p, newVideo: null }))}
                        className="text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {formData.thumbnail && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 relative rounded overflow-hidden">
                      <Image src={formData.thumbnail} alt="Thumbnail" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current Thumbnail</p>
                      <p className="text-xs text-gray-500">Click any image above to change</p>
                    </div>
                  </div>
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

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? (
                    <>
                      {uploadProgress > 0 ? (
                        <span className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                          <span>{uploadProgress}%</span>
                        </span>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      )}
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

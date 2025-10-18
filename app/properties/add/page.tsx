"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Upload,
  MapPin,
  IndianRupee,
  Bed,
  Bath,
  Square,
  Car,
  Wifi,
  Zap,
  Shield,
  Trees,
  Camera,
  CheckCircle,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { amenitiesList, propertyType, statesAndLGAs } from "@/app/data";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { set } from "date-fns";
import { toast } from "sonner";
import { Range, Slider } from "@radix-ui/react-slider";
export default function AddPropertyPage() {
  const { base } = Req;
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    type: "",
    category: "",
    price: "",
    pincode: "",
    // Location
    location: "",
    address: "",
    state: "",
    lga: "",

    // Property Details
    bedrooms: "",
    bathrooms: "",
    area: "",
    furnishing: "",
    floor: "",
    totalFloors: "",
    age: "",
    waterSuply: true,
    electricity: 0,

    // Amenities
    amenities: [] as string[],

    // Images
    images: [] as File[],
    video: null as File | null,
    thumbnail: null as File | null,
    // Contact
    contactPreference: "both", // phone, email, both
    availableFrom: "",
  });
  const [selectedState, setSelectedState] = useState<string>("all");

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityId],
      });
    } else {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((id) => id !== amenityId),
      });
    }
  };
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const data = new FormData();
      if (formData.thumbnail) {
        alert("ok");
        data.append("thumbnail", formData.thumbnail);
      }
      data.append("title", formData.title);
      data.append("state", formData.state);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("price", formData.price.toString()); // 👈 string but numeric value
      data.append("location", formData.location);
      data.append("type", formData.type);
      data.append("address", formData.address);
      data.append("bedroom", formData.bedrooms);
      data.append("bathroom", formData.bathrooms);
      data.append("floor", formData.floor);
      data.append("age", formData.age);
      data.append("area", formData.area);
      data.append("totalFloors", formData.totalFloors);
      data.append("age", formData.age);
      data.append("waterSuply", String(formData.waterSuply)); // 👈 "true"/"false"
      data.append("electricity", formData.electricity.toString());
      data.append("host", user?._id || "");
      formData.amenities.forEach((amenity) => {
        data.append("amenities[]", amenity);
      });

      data.append("maxgeust", "1");
      data.append("thumbnail", formData.images[0]); // 👈 default since schema requires it
      toast.message(String(data.get("thumbnail")));
      // Use gallery instead of files
      formData.images.forEach((file) => {
        data.append("files", file);
      });
      data.append("video", formData.video as Blob);
      console.log(data.getAll("files"));
      const res = await fetch(`${base}/v1/house`, {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Upload failed");
      toast.success("Property listed successfully!");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file (mp4, mov, etc.)");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Video size must be less than 50MB");
      return;
    }
    setFormData((prev) => ({ ...prev, video: file }));
  };

  const handleThumbnailSelect = (index: number) => {
    setSelected(index);
    setFormData((prev) => ({ ...prev, thumbnail: prev.images[index] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages].slice(0, 10), // Max 10 images
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };
  const removeVideo = () => {
    setFormData({
      ...formData,
      video: null,
    });
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                AgentWithMe
              </span>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            List Your Property
          </h1>
          <p className="text-gray-600 mt-2">
            Get your property in front of thousands of potential tenants/buyers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
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

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Listing Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="What do you want to do?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent Out</SelectItem>
                        <SelectItem value="sale">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Property Type *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyType.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 2BHK Apartment in Bandra West with Sea View"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Make it descriptive and attractive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property, its features, nearby amenities, and what makes it special..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500">Minimum 50 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="text"
                      placeholder={
                        formData.type === "rent"
                          ? "Monthly rent (e.g., 45000)"
                          : "Sale price (e.g., 1200000)"
                      }
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.type === "rent"
                      ? "Enter monthly rent amount"
                      : "Enter total sale price"}
                  </p>
                </div>
                <Slider>
                  <Range
                    min={0}
                    max={10000000}
                    step={100000}
                    className="w-full"
                  />
                </Slider>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>
                  Help people find your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Label htmlFor="lga">state *</Label>
                  <Select
                    name="state"
                    onValueChange={(value) => {
                      setSelectedState(value);
                      setFormData((prev) => ({
                        ...prev,
                        state: value,
                        lga: "all",
                      }));
                    }}
                  >
                    <SelectTrigger className="w-40 w-full">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(statesAndLGAs).map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* ✅ LGA (depends on selected state) */}
                  <div className="space-y-2 ">
                    <Label htmlFor="lga">LGA *</Label>
                    <Select
                      name="lga"
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, lga: value }))
                      }
                      disabled={selectedState === "all"}
                    >
                      <SelectTrigger className=" w-full">
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
                    </Select>{" "}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete address with building name, street, and nearby landmarks"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="e.g., 400050"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    maxLength={6}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Property Details */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Specifications</CardTitle>
                <CardDescription>
                  Provide detailed information about your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Select
                        value={formData.bedrooms}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bedrooms: value })
                        }
                      >
                        <SelectTrigger className="pl-10">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Select
                        value={formData.bathrooms}
                        onValueChange={(value) =>
                          setFormData({ ...formData, bathrooms: value })
                        }
                      >
                        <SelectTrigger className="pl-10">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq ft) *</Label>
                    <div className="relative">
                      <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="area"
                        type="number"
                        placeholder="e.g., 850"
                        value={formData.area}
                        onChange={(e) =>
                          setFormData({ ...formData, area: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="furnishing">Furnishing Status *</Label>
                    <Select
                      value={formData.furnishing}
                      onValueChange={(value) =>
                        setFormData({ ...formData, furnishing: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select furnishing status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                        <SelectItem value="semi-furnished">
                          Semi-Furnished
                        </SelectItem>
                        <SelectItem value="fully-furnished">
                          Fully Furnished
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Property Age</Label>
                    <Select
                      value={formData.age}
                      onValueChange={(value) =>
                        setFormData({ ...formData, age: "1" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">0-1 :: years (New)</SelectItem>
                        <SelectItem value="1">1-5 years</SelectItem>
                        <SelectItem value="5">5-10 years</SelectItem>
                        <SelectItem value="10">10-15 years</SelectItem>
                        <SelectItem value="15">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      type="text"
                      placeholder="e.g., 3rd Floor, Ground Floor"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalFloors">Total Floors</Label>
                    <Input
                      id="totalFloors"
                      type="number"
                      placeholder="e.g., 10"
                      value={formData.totalFloors}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalFloors: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <Label>Amenities & Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesList.map((amenity) => (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity.id}
                          checked={formData.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity.id, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={amenity.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <amenity.icon className="h-4 w-4" />
                          <span>{amenity.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableFrom: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Photos & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Photos</CardTitle>
                  <CardDescription>
                    Add high-quality photos to attract more inquiries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <Label
                      htmlFor="image-upload"
                      className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-gray-400 hover:bg-gray-50"
                    >
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-700 mb-2 font-medium">
                        Upload property photos (Max 10)
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        JPG, PNG files up to 5MB each
                      </p>

                      <Button
                        type="button"
                        variant="outline"
                        className="bg-transparent border-gray-300 hover:border-gray-400"
                      >
                        <Upload className="h-4 w-4 mr-2 text-gray-600" />
                        Choose Photos
                      </Button>

                      {/* Hidden File Input */}
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        id="image-upload"
                        className="hidden"
                      />
                    </Label>
                  </div>
                </CardContent>
              </Card>
              <CardContent>
                <div className="space-y-8">
                  {/* IMAGE GALLERY UPLOAD */}

                  {/* IMAGE PREVIEW GRID */}
                  {formData.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Uploaded Photos ({formData.images.length}/10):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div
                            key={index}
                            className={`relative group ${
                              selected === index
                                ? "border-4 border-blue-500"
                                : ""
                            }`}
                            onClick={() => handleThumbnailSelect(index)}
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`upload-${index}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <Badge
                              variant="outline"
                              className="absolute top-1 left-1 text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition hover:bg-red-50 dark:hover:bg-red-900"
                              onClick={() => removeImage(index)}
                            >
                              Remove
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VIDEO UPLOAD */}
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                    onClick={() =>
                      document.getElementById("video-upload")?.click()
                    }
                  >
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Upload property video (Max 1 photos)
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      MP4 files up to 5MB each
                    </p>

                    <Input
                      id="video-upload"
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer bg-transparent"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photos
                    </Button>
                  </div>
                  {formData.video && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm p-2">
                      <video
                        src={URL.createObjectURL(formData.video)}
                        controls
                        className="w-full rounded-lg max-h-64 object-cover"
                      />
                      <div className="flex items-center justify-between mt-2 px-1">
                        <p className="text-sm text-gray-500 truncate">
                          {formData.video.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeVideo}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* THUMBNAIL UPLOAD */}
                </div>
              </CardContent>

              {/* Contact Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Preferences</CardTitle>
                  <CardDescription>
                    How would you like to be contacted?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred Contact Method</Label>
                      <Select
                        value={formData.contactPreference}
                        onValueChange={(value) =>
                          setFormData({ ...formData, contactPreference: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Only</SelectItem>
                          <SelectItem value="email">Email Only</SelectItem>
                          <SelectItem value="both">
                            Both Phone & Email
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Free Trial Info */}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
              </Link>

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button disabled={isLoading}>
                  {isLoading
                    ? "Publishing Property..."
                    : "Publish Property - FREE"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

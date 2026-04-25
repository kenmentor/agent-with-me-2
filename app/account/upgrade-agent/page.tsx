"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
  Clock,
  Shield,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileText,
  Award,
  Users,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import Req from "@/app/utility/axois";

const { base, app } = Req;

const STEPS = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Agent Details", icon: Briefcase },
  { id: 3, name: "Experience", icon: Award },
  { id: 4, name: "Review", icon: FileText },
];

export default function UpgradeToAgentPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSent, setApplicationSent] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    agencyName: "",
    agencyAddress: "",
    yearsOfExperience: "",
    licenseNumber: "",
    serviceAreas: "",
    bio: "",
    specializations: [] as string[],
    referralCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!_hasHydrated) return;
    
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    
    if (user.role === "agent") {
      toast.error("You are already an agent");
      router.replace("/dashboard");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      userName: user.userName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    }));
  }, [_hasHydrated, isAuthenticated, user, router]);

  const specializationsList = [
    "Residential Sales",
    "Residential Rentals",
    "Commercial Properties",
    "Luxury Homes",
    "Land Sales",
    "Property Management",
    "Shortlet/Airbnb",
    "International Properties",
  ];

  const handleSpecializationToggle = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    setErrors({});

    switch (step) {
      case 1:
        if (!formData.userName.trim()) newErrors.userName = "Full name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
        }
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
        break;
      case 2:
        if (!formData.agencyName.trim()) newErrors.agencyName = "Agency/Company name is required";
        if (!formData.agencyAddress.trim()) newErrors.agencyAddress = "Agency address is required";
        break;
      case 3:
        if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required";
        if (!formData.serviceAreas.trim()) newErrors.serviceAreas = "Service areas are required";
        break;
      case 4:
        if (formData.specializations.length === 0) {
          newErrors.specializations = "Select at least one specialization";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);

    try {
      const payload = {
        userId: user?._id,
        currentRole: user?.role,
        requestedRole: "agent",
        applicationData: {
          personalInfo: {
            userName: formData.userName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
          },
          agentDetails: {
            agencyName: formData.agencyName,
            agencyAddress: formData.agencyAddress,
            licenseNumber: formData.licenseNumber,
          },
          experience: {
            yearsOfExperience: formData.yearsOfExperience,
            serviceAreas: formData.serviceAreas,
            specializations: formData.specializations,
            bio: formData.bio,
            referralCode: formData.referralCode,
          },
        },
      };

      const res = await app.post(`${base}/v1/auth/upgrade-to-agent`, payload);

      if (res.data?.ok) {
        setApplicationSent(true);
        toast.success("Application submitted successfully!");
        
        if (res.data?.data?.user) {
          setUser(res.data.data.user);
        }
      } else {
        throw new Error(res.data?.message || "Application failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (applicationSent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h1>
            <p className="text-gray-600 mb-6">
              Your application to become an agent has been submitted successfully. 
              Our team will review your application and get back to you within 24-48 hours.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Our team will review your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>We may contact you for verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Once approved, you'll get agent access</span>
                </li>
              </ul>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account" className="text-gray-600 hover:text-gray-900 inline-flex items-center text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Account
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Upgrade to Agent</CardTitle>
                <CardDescription>
                  Apply to become a property agent on Agent With Me
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="ml-2 text-sm hidden sm:block">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-1" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {STEPS[currentStep - 1].name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Your profile information has been pre-filled from your account. Please verify and update if needed.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name *</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                  {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+234 801 234 5678"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    placeholder="Enter your current address"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Tell us about your real estate agency or business.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="agencyName">Agency/Company Name *</Label>
                  <Input
                    id="agencyName"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    placeholder="Enter your agency or company name"
                  />
                  {errors.agencyName && <p className="text-red-500 text-sm">{errors.agencyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyAddress">Agency Address *</Label>
                  <Textarea
                    id="agencyAddress"
                    value={formData.agencyAddress}
                    onChange={(e) => setFormData({ ...formData, agencyAddress: e.target.value })}
                    rows={2}
                    placeholder="Enter your agency office address"
                  />
                  {errors.agencyAddress && <p className="text-red-500 text-sm">{errors.agencyAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number (Optional)</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="Enter your real estate license number if available"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Share your experience and expertise in real estate.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    placeholder="e.g., 3"
                  />
                  {errors.yearsOfExperience && <p className="text-red-500 text-sm">{errors.yearsOfExperience}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceAreas">Service Areas *</Label>
                  <Textarea
                    id="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
                    rows={2}
                    placeholder="List the areas/cities you serve, e.g., Lagos Island, Victoria Island, Lekki"
                  />
                  {errors.serviceAreas && <p className="text-red-500 text-sm">{errors.serviceAreas}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell potential clients about your experience and what makes you unique..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                    placeholder="Enter referral code if you have one"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Select your areas of specialization.
                </p>

                <div className="space-y-2">
                  <Label>Specializations *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {specializationsList.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleSpecializationToggle(spec)}
                        className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                          formData.specializations.includes(spec)
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              formData.specializations.includes(spec)
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {formData.specializations.includes(spec) && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span>{spec}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.specializations && (
                    <p className="text-red-500 text-sm">{errors.specializations}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold mb-3">Application Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{formData.userName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{formData.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Agency:</span>
                      <span className="ml-2 font-medium">{formData.agencyName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2 font-medium">{formData.yearsOfExperience} years</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Areas:</span>
                      <span className="ml-2 font-medium">{formData.specializations.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4 pt-6 mt-6 border-t">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Application
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
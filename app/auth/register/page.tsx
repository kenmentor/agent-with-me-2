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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, User, Building, Phone, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = "guest";
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    phoneNumber: "",
    confirmPassword: "",
    role: defaultRole,
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [sentCode, setsentCode] = useState(false);
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.userName.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phoneNumber.trim())
      newErrors.phone = "Phone number is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    if (!formData.agreeToTerms)
      newErrors.terms = "Please accept terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Store user data

    e.preventDefault();
    const userData = {
      id: Date.now(),
      name: formData.userName,
      email: formData.email,
      phone: formData.phoneNumber,
      role: formData.role,
      verified: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("pendingVerification", "true");
    try {
      const data = await signup(formData);
      setsentCode(true);
      console.log("Signup successful:", data);
    } catch (error) {
      console.log("Signup error:", error);
    }

    console.log("Error:", error);
    console.log("Loading:", isLoading);
    console.log("User:", user);

    isLoading(false);
    router.push("/auth/verify");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {!sentCode ? (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Home className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Join Agent with me </CardTitle>
              <CardDescription>Create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                      <RadioGroupItem value="guest" id="tenant" />
                      <Label
                        htmlFor="tenant"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">Tenant</div>
                          <div className="text-xs text-gray-500">
                            Looking for property
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                      <RadioGroupItem value="host" id="landlord" />
                      <Label
                        htmlFor="landlord"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Building className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Landlord</div>
                          <div className="text-xs text-gray-500">
                            Have property to rent/sell
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.userName}
                      onChange={(e) =>
                        setFormData({ ...formData, userName: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      placeholder="Enter your full name"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        agreeToTerms: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Home className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Check Email For Code </CardTitle>
              <CardDescription>Create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
              >
                <Button className="w-full mb-4">
                  <Mail className="h-4 w-4 mr-2" />
                  Go to Mail
                </Button>
              </a>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

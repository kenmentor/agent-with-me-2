"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Camera,
  Save,
  Loader2,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import { useAuthCheck } from "@/hooks/useAuth";
import Req from "@/app/utility/axios";
import { toast } from "sonner";
import { getDisplayName, getFirstName } from "@/lib/utils";

const { app, base } = Req;

interface UserProfile {
  _id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  avatar?: string;
  profileImage?: string;
  address?: string;
  bio?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    bio: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isReady, isAuthenticated, user } = useAuthCheck({
    requireAuth: true,
    redirectTo: "/auth/login",
  });

  useEffect(() => {
    if (isReady && user) {
      setProfile(user);
      setFormData({
        userName: user?.userName || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        address: user?.address || "",
        bio: user?.bio || "",
      });
    }
  }, [isReady, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const userId = user?._id;
    
    if (!userId) {
      toast.error("User not found. Please login again.");
      setSaving(false);
      return;
    }
    
    try {
      // Send editable fields including firstName and lastName
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
      };
      
      const res = await app.put(`${base}/v1/user/${userId}`, updateData);
      if (res.data?.ok || res.data?.success) {
        const updatedUser = res.data?.data || res.data?.user || res.data;
        if (updatedUser) {
          // Update zustand store
          setUser(updatedUser);
          // Update local profile state
          setProfile(updatedUser);
          // Update form with all user data (preserve non-editable fields)
          setFormData(prev => ({
            ...prev,
            ...updatedUser,
          }));
        }
        toast.success("Profile updated successfully");
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?._id) {
      toast.error("User not found. Please login again.");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("profileImage", file);

      const res = await app.post(`${base}/v1/user/uploadProfile/${user._id}`, uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.ok || res.data?.success) {
        const updatedUser = res.data?.data || res.data?.user || res.data;
        if (updatedUser) {
          // Update both zustand store AND local profile state
          setUser(updatedUser);
          setProfile(updatedUser);
          // Force re-render by updating formData with new user data
          setFormData(prev => ({
            ...prev,
            userName: updatedUser.userName || prev.userName,
            email: updatedUser.email || prev.email,
            phoneNumber: updatedUser.phoneNumber || prev.phoneNumber,
            address: updatedUser.address || prev.address,
            bio: updatedUser.bio || prev.bio,
          }));
        }
        toast.success("Profile image updated");
      } else {
        toast.error(res.data?.message || "Failed to upload image");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to upload image";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.replace("/");
    toast.success("Logged out successfully");
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const avatarUrl = profile?.profileImage || profile?.avatar || user?.profileImage || user?.avatar;
  const initials = getFirstName(profile || user)[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Bell className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={avatarUrl} alt={getDisplayName(user)} />
                      <AvatarFallback className="text-2xl bg-blue-600 text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg">{getDisplayName(user)}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium capitalize text-blue-600">
                        {user?.role || "User"}
                      </span>
                    </div>
                    {user?.role === "guest" && (
                      <Link href="/account/upgrade-agent">
                        <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                          <Shield className="w-4 h-4 mr-2" />
                          Become an Agent
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Your first name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="userName"
                          name="userName"
                          value={formData.userName}
                          disabled
                          readOnly
                          className="pl-10 bg-gray-50 cursor-not-allowed"
                          placeholder="Your username"
                        />
                      </div>
                      <p className="text-xs text-gray-400">Username cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          disabled
                          readOnly
                          className="pl-10 bg-gray-50 cursor-not-allowed"
                          placeholder="your@email.com"
                        />
                      </div>
                      <p className="text-xs text-gray-400">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="pl-10"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          disabled
                          readOnly
                          className="pl-10 bg-gray-50 cursor-not-allowed"
                          placeholder="Your address"
                        />
                      </div>
                      <p className="text-xs text-gray-400">Address cannot be changed</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-500">Change your account password</p>
                    </div>
                  </div>
                  <Link href="/auth/forgot-password">
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <LogOut className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Active Sessions</h4>
                      <p className="text-sm text-gray-500">Manage your logged in devices</p>
                    </div>
                  </div>
                  <Link href="/account/sessions">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications on your device</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">Payment Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified about payments</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">Help & Support</h4>
                      <p className="text-sm text-gray-500">Get help with your account</p>
                    </div>
                  </div>
                  <Link href="/help">
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-white border rounded-lg">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </main>
    </div>
  );
}



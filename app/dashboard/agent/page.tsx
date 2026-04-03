"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  MessageSquare,
  LogOut,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Users,
  Copy,
  Share2,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { toast } from "sonner";
import {
  DashboardStatsSkeleton,
  PropertyListSkeleton,
  TourListSkeleton,
  PaymentListSkeleton,
} from "@/components/ui/skeleton";

const { base, app } = Req;

interface Property {
  _id: string;
  title: string;
  thumbnail: string;
  price: string;
  location: string;
  host?: { userName: string };
  verified: boolean;
}

interface Tour {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  propertyThumbnail?: string;
  propertyLocation?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt?: string;
}

interface Payout {
  _id: string;
  amount: number;
  status: "pending" | "paid";
  propertyTitle: string;
  date: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const referralCode = user?.referralCode || `AGENT${user?._id?.slice(-6).toUpperCase()}` || "AGENT1234";

  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const [propertiesRes, toursRes, payoutsRes] = await Promise.all([
        app.get(`${base}/v1/house?agentId=${user._id}`).catch(() => ({ data: { data: [] } })),
        app.get(`${base}/v1/tour/agent/${user._id}`).catch(() => ({ data: { data: [] } })),
        app.get(`${base}/v1/payout/agent/${user._id}`).catch(() => ({ data: { data: [] } })),
      ]);
      
      setProperties(propertiesRes.data?.data || []);
      setTours(toursRes.data?.data || []);
      setPayouts(payoutsRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [app, base, user?._id]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [_hasHydrated, isAuthenticated, user, router, fetchData]);

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString()}`;

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      router.push("/");
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Agent with Me",
        text: `Use my referral code: ${referralCode} to register as a landlord`,
        url: window.location.origin + "/auth/register/landlord",
      });
    } else {
      copyReferralCode();
    }
  };

  const getTourStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const upcomingTours = tours.filter(t => t.status === "scheduled");
  const todayTours = tours.filter(t => t.status === "scheduled" && t.scheduledDate === new Date().toISOString().split('T')[0]);
  const pastTours = tours.filter(t => t.status !== "scheduled");

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "properties", icon: Building2, label: "Properties", badge: properties.length || null },
    { id: "tours", icon: Calendar, label: "Tours", badge: upcomingTours.length || null },
    { id: "payouts", icon: DollarSign, label: "Payouts" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <>
      <Header color="black" />
      <div className="min-h-screen bg-gray-50 pt-[60px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {user?.userName?.charAt(0)?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user?.userName}</h3>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">Agent</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <span className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </Button>
                    );
                  })}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>

              {/* Referral Code Card */}
              <Card className="mt-4 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                <CardContent className="pt-4">
                  <p className="text-purple-100 text-xs mb-1">Your Referral Code</p>
                  <p className="text-2xl font-bold tracking-wider">{referralCode}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={copyReferralCode}>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1" onClick={shareReferralCode}>
                      <Share2 className="h-3 w-3 mr-1" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">
                    Welcome, {user?.userName?.split(" ")[0]}! 👋
                  </h1>

                  {/* Stats Cards */}
                  {loading ? (
                    <DashboardStatsSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("properties")}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Properties</p>
                              <p className="text-2xl font-bold">{properties.length}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("tours")}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Today&apos;s Tours</p>
                              <p className="text-2xl font-bold">{todayTours.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("tours")}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Upcoming</p>
                              <p className="text-2xl font-bold">{upcomingTours.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Pending Payout</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0))}
                              </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Today's Tours */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Today&apos;s Tours ({loading ? "-" : todayTours.length})
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("tours")}>
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : todayTours.length > 0 ? (
                        <div className="space-y-3">
                          {todayTours.map((tour) => (
                            <div key={tour._id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{tour.guestName}</p>
                                <p className="text-sm text-gray-500">{tour.propertyTitle}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {tour.propertyLocation || "Location not specified"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-blue-600">{tour.scheduledTime || "Time TBD"}</p>
                                <Badge className="bg-blue-500 mt-1">Today</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No tours scheduled for today</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Properties */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Recent Properties</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("properties")}>
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-16 h-12 bg-gray-200 rounded animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : properties.length > 0 ? (
                        <div className="space-y-3">
                          {properties.slice(0, 3).map((property) => (
                            <div key={property._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                                {property.thumbnail && (
                                  <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{property.title}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {property.location}
                                </p>
                              </div>
                              <Badge variant={property.verified ? "default" : "secondary"}>
                                {property.verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No properties yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Properties */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Recent Properties</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("properties")}>
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-16 h-12 bg-gray-200 rounded animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : properties.length > 0 ? (
                        <div className="space-y-3">
                          {properties.slice(0, 3).map((property) => (
                            <div key={property._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                                {property.thumbnail && (
                                  <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{property.title}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {property.location}
                                </p>
                              </div>
                              <Badge variant={property.verified ? "default" : "secondary"}>
                                {property.verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No properties yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Properties Tab */}
              {activeTab === "properties" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Managed Properties</h1>
                    <Link href="/properties/add">
                      <Button><Building2 className="h-4 w-4 mr-2" /> Add Property</Button>
                    </Link>
                  </div>
                  {loading ? (
                    <PropertyListSkeleton count={6} />
                  ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {properties.map((property) => (
                        <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-gray-200 relative">
                            {property.thumbnail ? (
                              <img src={property.thumbnail} alt={property.title} className="object-cover w-full h-full" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Building2 className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge variant={property.verified ? "default" : "secondary"} className={property.verified ? "bg-green-500" : ""}>
                                {property.verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold truncate">{property.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" /> {property.location}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Host: {property.host?.userName || "Unknown"}</p>
                            <div className="flex gap-2 mt-3">
                              <Link href={`/properties/${property._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                              </Link>
                              <Link href={`/dashboard/edit/${property._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No managed properties</h3>
                        <p className="text-gray-500 mb-4">Share your referral code with landlords to manage their properties</p>
                        <Button onClick={shareReferralCode}>Share Referral Code</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Tours Tab */}
              {activeTab === "tours" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">Property Tours</h1>

                  {/* Today's Tours */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Today&apos;s Tours ({loading ? "-" : todayTours.length})
                    </h2>
                    {loading ? (
                      <TourListSkeleton count={2} />
                    ) : todayTours.length > 0 ? (
                      <div className="space-y-4">
                        {todayTours.map((tour) => (
                          <Card key={tour._id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {tour.propertyThumbnail && (
                                    <img src={tour.propertyThumbnail} alt={tour.propertyTitle} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{tour.propertyTitle}</h3>
                                    <Badge className="bg-blue-500">TODAY</Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                      <User className="h-4 w-4" /> {tour.guestName}
                                    </span>
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                      <Phone className="h-4 w-4" /> {tour.guestPhone}
                                    </span>
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                      <Clock className="h-4 w-4" /> {tour.scheduledTime || "Time TBD"}
                                    </span>
                                  </div>
                                </div>
                                <Link href={`/properties/${tour.propertyId}`}>
                                  <Button size="sm">View Property</Button>
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-gray-50">
                        <CardContent className="py-6 text-center">
                          <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No tours scheduled for today</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Upcoming Tours */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Upcoming Tours ({loading ? "-" : upcomingTours.filter(t => t.scheduledDate !== new Date().toISOString().split('T')[0]).length})
                    </h2>
                    {!loading && upcomingTours.filter(t => t.scheduledDate !== new Date().toISOString().split('T')[0]).length > 0 ? (
                      <div className="space-y-4">
                        {upcomingTours.filter(t => t.scheduledDate !== new Date().toISOString().split('T')[0]).map((tour) => (
                          <Card key={tour._id} className="border-l-4 border-l-orange-400">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{tour.propertyTitle}</h3>
                                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" /> {tour.scheduledDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <User className="h-4 w-4" /> {tour.guestName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-4 w-4" /> {tour.guestPhone}
                                    </span>
                                  </div>
                                </div>
                                {getTourStatusBadge(tour.status)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : !loading ? (
                      <Card className="bg-gray-50">
                        <CardContent className="py-6 text-center">
                          <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No upcoming tours</p>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>

                  {/* Past Tours */}
                  {!loading && pastTours.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-gray-500" />
                        Tour History ({pastTours.length})
                      </h2>
                      <div className="space-y-4">
                        {pastTours.slice(0, 10).map((tour) => (
                          <Card key={tour._id} className={`opacity-75 ${tour.status === "cancelled" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"}`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                  <h3 className="font-medium">{tour.propertyTitle}</h3>
                                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                    <span>{tour.scheduledDate}</span>
                                    <span>•</span>
                                    <span>{tour.guestName}</span>
                                  </div>
                                </div>
                                {getTourStatusBadge(tour.status)}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payouts Tab */}
              {activeTab === "payouts" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Payouts</h1>
                  {loading ? (
                    <PaymentListSkeleton count={5} />
                  ) : payouts.length > 0 ? (
                    <div className="space-y-4">
                      {payouts.map((payout) => (
                        <Card key={payout._id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{payout.propertyTitle}</p>
                                <p className="text-sm text-gray-500">{payout.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">{formatCurrency(payout.amount)}</p>
                                <Badge variant={payout.status === "paid" ? "default" : "secondary"} className={payout.status === "paid" ? "bg-green-500" : ""}>
                                  {payout.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="py-12 text-center">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No payouts yet</h3>
                        <p className="text-gray-500">Your commissions will appear here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Messages</h1>
                  <Card className="bg-gray-50">
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages yet</h3>
                      <p className="text-gray-500">Messages from landlords and tenants will appear here</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

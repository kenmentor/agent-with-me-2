"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Heart,
  Calendar,
  LogOut,
  Search,
  MapPin,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axios";
import { toast } from "sonner";
import {
  DashboardStatsSkeleton,
  PropertyListSkeleton,
  TourListSkeleton,
  PaymentListSkeleton,
} from "@/components/ui/skeleton";
import { isRole, getDashboardRoute } from "@/lib/roles";
import { getFirstName, getDisplayName } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const { base, app } = Req;

interface Property {
  _id: string;
  title: string;
  thumbnail: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
}

interface Payment {
  _id: string;
  propertyTitle: string;
  amount: number;
  status: string;
  paidDate: string;
}

interface Tour {
  _id: string;
  propertyId?: string;
  propertyTitle: string;
  propertyThumbnail?: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: "scheduled" | "completed" | "cancelled";
  agentName?: string;
  notes?: string;
}

export default function GuestDashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [savedHouses, setSavedHouses] = useState<Property[]>([]);
  const [likedProperties, setLikedProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const userIdRef = useRef(user?._id);

  const fetchData = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    
    if (initialized) return;
    
    setInitialized(true);
    try {
      setLoading(true);
      const [savedRes, paymentsRes, toursRes] = await Promise.all([
        app.get(`${base}/v1/favorites/${currentUserId}`).catch(() => ({ data: { data: [] } })),
        app.get(`${base}/v1/payment/${currentUserId}`).catch(() => ({ data: { data: [] } })),
        app.get(`${base}/v1/tour/guest/${currentUserId}`).catch(() => ({ data: { data: [] } })),
      ]);
      
      setSavedHouses(savedRes.data?.data || []);
      setPayments(paymentsRes.data?.data || []);
      setLikedProperties(savedRes.data?.data || []);
      setTours(toursRes.data?.data || []);
    } catch (err) {
// console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [app, base, initialized]);

  useEffect(() => {
    userIdRef.current = user?._id;
  }, [user?._id]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    
    if (!isRole(["guest"])) {
      router.replace(getDashboardRoute());
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
  const pastTours = tours.filter(t => t.status !== "scheduled");

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "saved", icon: Heart, label: "Saved Houses" },
    { id: "tours", icon: Calendar, label: "My Tours", badge: upcomingTours.length || null },
    { id: "payments", icon: Clock, label: "Payments" },
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
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getFirstName(user).charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{getDisplayName(user)}</h3>
                      <Badge variant="outline" className="text-xs">Guest</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      (item.label=="Messages")?(
                        <Link href={"/chat"}>
                      <Button
                
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <span className="flex items-center ">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        ) : null}
                      </Button>
                      </Link>):(
                        
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
                      )
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
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">
                    Welcome back, {getFirstName(user)}! 👋
                  </h1>

                  {/* Stats Cards */}
                  {loading ? (
                    <DashboardStatsSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("saved")}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Saved</p>
                              <p className="text-2xl font-bold">{savedHouses.length}</p>
                            </div>
                            <Heart className="h-8 w-8 text-pink-500" />
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
                            <Calendar className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Payments</p>
                              <p className="text-2xl font-bold">{payments.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Spent</p>
                              <p className="text-lg font-bold">{formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}</p>
                            </div>
                            <Eye className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Upcoming Tours Preview */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Upcoming Tours</CardTitle>
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
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : upcomingTours.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingTours.slice(0, 3).map((tour) => (
                            <div key={tour._id} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{tour.propertyTitle}</p>
                                <p className="text-sm text-gray-500">{tour.scheduledDate}</p>
                              </div>
                              <Badge className="bg-blue-500">Scheduled</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No upcoming tours</p>
                          <Link href="/properties" className="mt-2 inline-block">
                            <Button size="sm" className="mt-2">Browse Properties</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                      <Link href="/properties">
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4 mr-2" />
                          Browse Properties
                        </Button>
                      </Link>
                      <Link href="/chat">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tours Tab */}
              {activeTab === "tours" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold">My Tours</h1>

                  {/* Upcoming Tours */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Upcoming Tours ({loading ? "-" : upcomingTours.length})
                    </h2>
                    {loading ? (
                      <TourListSkeleton count={3} />
                    ) : upcomingTours.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingTours.map((tour) => (
                          <Card key={tour._id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {tour.propertyThumbnail && (
                                    <img src={tour.propertyThumbnail} alt={tour.propertyTitle} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{tour.propertyTitle}</h3>
                                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {tour.scheduledDate}
                                    </span>
                                    {tour.scheduledTime && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {tour.scheduledTime}
                                      </span>
                                    )}
                                    {tour.agentName && (
                                      <span className="flex items-center gap-1">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className="text-xs">{tour.agentName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {tour.agentName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getTourStatusBadge(tour.status)}
                                  {tour.propertyId && (
                                    <Link href={`/properties/${tour.propertyId}`}>
                                      <Button size="sm" variant="outline">View Property</Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-gray-50">
                        <CardContent className="py-8 text-center">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 mb-4">No upcoming tours scheduled</p>
                          <Link href="/properties">
                            <Button>Schedule a Tour</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Past Tours */}
                  {!loading && pastTours.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-gray-500" />
                        Tour History ({pastTours.length})
                      </h2>
                      <div className="space-y-4">
                        {pastTours.map((tour) => (
                          <Card key={tour._id} className={`opacity-75 ${tour.status === "cancelled" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-green-500"}`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                  <h3 className="font-medium">{tour.propertyTitle}</h3>
                                  <p className="text-sm text-gray-500">{tour.scheduledDate}</p>
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

              {/* Saved Tab */}
              {activeTab === "saved" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Saved Houses</h1>
                  {loading ? (
                    <PropertyListSkeleton count={6} />
                  ) : savedHouses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedHouses.map((house) => (
                        <Card key={house._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-gray-200 relative">
                            {house.thumbnail ? (
                              <img src={house.thumbnail} alt={house.title} className="object-cover w-full h-full" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Home className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-pink-500 text-white p-1.5 rounded-full">
                              <Heart className="h-4 w-4 fill-current" />
                            </div>
                          </div>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold truncate">{house.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {house.location}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <span>{house.bedrooms} Beds</span>
                              <span>{house.bathrooms} Baths</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600 mt-2">
                              {formatCurrency(Number(house.price))}
                            </p>
                            <Link href={`/properties/${house._id}`} className="mt-3 block">
                              <Button className="w-full">View Details</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="py-12 text-center">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved houses yet</h3>
                        <p className="text-gray-500 mb-4">Start browsing and save properties you like</p>
                        <Link href="/properties"><Button>Browse Properties</Button></Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Payment History</h1>
                  {loading ? (
                    <PaymentListSkeleton count={5} />
                  ) : payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <Card key={payment._id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{payment.propertyTitle}</p>
                                <p className="text-sm text-gray-500">{payment.paidDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                <Badge variant={payment.status === "success" ? "default" : "secondary"} className="mt-1">
                                  {payment.status}
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
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No payment history</h3>
                        <p className="text-gray-500">Your payments will appear here</p>
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
                      <p className="text-gray-500 mb-4">Start a conversation with a Host or agent</p>
                      <Link href="/properties"><Button>Browse Properties</Button></Link>
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



"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  MessageSquare,
  Settings,
  CreditCard,
  Plus,
  Edit,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  DollarSign,
  Building2,
  Calendar,
  User,
  Phone,
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
import { isRole, getDashboardRoute } from "@/lib/roles";
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
  verified: boolean;
  status?: string;
}

interface Payment {
  _id: string;
  propertyTitle: string;
  guest: string;
  amount: number;
  status: string;
  paidDate: string;
}

interface Tour {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestPhone: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export default function LandlordDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <LandlordDashboardContent />
    </Suspense>
  );
}

function LandlordDashboardContent() {
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
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
      const [propertiesRes, paymentsRes, toursRes] = await Promise.all([
        app.get(`${base}/v1/house?hostId=${currentUserId}`).catch(() => ({ data: { data: [] } })),
        app.get(`${base}/v1/payment/${currentUserId}`).catch(() => ({ data: { data: [] } })),
        app.get(`${base}/v1/tour/landlord/${currentUserId}`).catch(() => ({ data: { data: [] } })),
      ]);
      
      setProperties(propertiesRes.data?.data || []);
      setPayments(paymentsRes.data?.data || []);
      setTours(toursRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
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
    
    if (!isRole(["landlord", "host"])) {
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

  const verifiedCount = properties.filter(p => p.verified).length;
  const pendingCount = properties.filter(p => !p.verified).length;
  const totalEarnings = payments
    .filter(p => p.status === "success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const upcomingTours = tours.filter(t => t.status === "scheduled");

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

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "properties", icon: Building2, label: "My Properties" },
    { id: "tours", icon: Calendar, label: "Tours", badge: upcomingTours.length || null },
    { id: "payments", icon: CreditCard, label: "Payments" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <Header color="black" />
      <div className="min-h-screen bg-gray-50 pt-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user?.userName}</h3>
                      <Badge variant="outline" className="text-xs">Landlord</Badge>
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
            </aside>

            <main className="flex-1">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                      Welcome, {user?.userName?.split(" ")[0]}!
                    </h1>
                    <Link href="/properties/add">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                      </Button>
                    </Link>
                  </div>
                  
                  {loading ? (
                    <DashboardStatsSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="cursor-pointer" onClick={() => setActiveTab("properties")}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Properties</p>
                              <p className="text-2xl font-bold">{properties.length}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="cursor-pointer" onClick={() => setActiveTab("tours")}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Upcoming Tours</p>
                              <p className="text-2xl font-bold">{upcomingTours.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Verified</p>
                              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Earnings</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(totalEarnings)}
                              </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-12 bg-gray-200 rounded animate-pulse" />
                                <div className="space-y-2">
                                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : properties.length > 0 ? (
                        <div className="space-y-4">
                          {properties.slice(0, 3).map((property) => (
                            <div key={property._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                                  {property.thumbnail && (
                                    <img
                                      src={property.thumbnail}
                                      alt={property.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{property.title}</p>
                                  <p className="text-sm text-gray-500">{property.location}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={property.verified ? "default" : "secondary"}>
                                  {property.verified ? "Verified" : "Pending"}
                                </Badge>
                                <Link href={`/dashboard/edit/${property._id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">No properties yet</p>
                          <Link href="/properties/add">
                            <Button>Add Your First Property</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "properties" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">My Properties</h1>
                    <Link href="/properties/add">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                      </Button>
                    </Link>
                  </div>
                  
                  {loading ? (
                    <PropertyListSkeleton count={6} />
                  ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {properties.map((property) => (
                        <Card key={property._id} className="overflow-hidden">
                          <div className="aspect-video bg-gray-200 relative">
                            {property.thumbnail ? (
                              <img
                                src={property.thumbnail}
                                alt={property.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Home className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <Badge variant={property.verified ? "default" : "secondary"}>
                                {property.verified ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="pt-4">
                            <h3 className="font-semibold truncate">{property.title}</h3>
                            <p className="text-sm text-gray-600">{property.location}</p>
                            <p className="text-lg font-bold text-blue-600 mt-2">
                              {formatCurrency(Number(property.price))}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Link href={`/properties/${property._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/dashboard/edit/${property._id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No properties listed
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Add your first property to start receiving bookings
                        </p>
                        <Link href="/properties/add">
                          <Button>Add Property</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "tours" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Property Tours</h1>
                  {loading ? (
                    <TourListSkeleton count={4} />
                  ) : tours.length > 0 ? (
                    <div className="space-y-4">
                      {tours.map((tour) => (
                        <Card key={tour._id} className={`border-l-4 ${tour.status === "scheduled" ? "border-l-blue-500" : tour.status === "completed" ? "border-l-green-500" : "border-l-red-500"}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold">{tour.propertyTitle}</h3>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <User className="h-4 w-4" /> {tour.guestName}
                                  </span>
                                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <Phone className="h-4 w-4" /> {tour.guestPhone}
                                  </span>
                                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <Calendar className="h-4 w-4" /> {tour.scheduledDate}
                                  </span>
                                  {tour.scheduledTime && (
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                      <Clock className="h-4 w-4" /> {tour.scheduledTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getTourStatusBadge(tour.status)}
                                <Link href={`/properties/${tour.propertyId}`}>
                                  <Button size="sm" variant="outline">View Property</Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-gray-50">
                      <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No tours scheduled</h3>
                        <p className="text-gray-500">Tours requested by tenants will appear here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Payment History</h1>
                  {loading ? (
                    <PaymentListSkeleton count={5} />
                  ) : payments.length > 0 ? (
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {payments.map((payment) => (
                            <div key={payment._id} className="p-4 flex items-center justify-between">
                              <div>
                                <p className="font-medium">{payment.propertyTitle}</p>
                                <p className="text-sm text-gray-500">
                                  From: {payment.guest} • {payment.paidDate}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                <Badge
                                  variant={payment.status === "success" ? "default" : "secondary"}
                                  className="mt-1"
                                >
                                  {payment.status === "success" ? (
                                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Paid</>
                                  ) : payment.status === "pending_approval" ? (
                                    <><Clock className="h-3 w-3 mr-1" /> Pending</>
                                  ) : (
                                    <><AlertCircle className="h-3 w-3 mr-1" /> {payment.status}</>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No payment history
                        </h3>
                        <p className="text-gray-500">You&apos;ll see payments from tenants here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "messages" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Messages</h1>
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No messages yet
                      </h3>
                      <p className="text-gray-500">Messages from tenants will appear here</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Settings</h1>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b">
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-gray-500">{user?.phoneNumber || "Not set"}</p>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button variant="destructive" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
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

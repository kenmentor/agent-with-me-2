"use client";
interface Property {
  _id?: string;
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
  contactPreference: string;
  availableFrom: string;
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  MessageSquare,
  Settings,
  CreditCard,
  CheckCircle2,
  Eye,
  Download,
  House,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { useAuthStore } from "@/store/authStore";
import BookingCard from "../../components/BookingCard";
import Req from "@/app/utility/axois";
import EditablePropertyCard from "@/components/EditablePropertyCard";
import { toast } from "sonner";
import { getDate } from "date-fns";
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
  const { app, base } = Req;
  const [activeTab, setActiveTab] = useState("overview");
  const [booking, setBooking] = useState<any[]>([
    {
      _id: "1",
      houseTitle: "3-Bedroom Duplex at Lekki Phase 1",
      guestName: "Chibuzor Mentor",
      tenantPhone: "+234 810 123 4567",
      amount: 450000,
      status: "pending",
      checkIn: "2025-10-20T00:00:00Z",
      checkOut: "2025-10-25T00:00:00Z",
      platformFee: 15000,
      expiredDate: "2025-10-21T00:00:00Z", // Will expire soon
    },
    {
      _id: "2",
      houseTitle: "Modern 2BHK Apartment, Calabar South",
      guestName: "Jane Smith",
      tenantPhone: "+234 809 888 9910",
      amount: 320000,
      status: "confirmed",
      checkIn: "2025-10-15T00:00:00Z",
      checkOut: "2025-10-22T00:00:00Z",
      platformFee: 10000,
      expiredDate: "2025-10-19T00:00:00Z", // Expired
    },
    {
      _id: "3",
      houseTitle: "Mini Flat Apartment at Uyo",
      guestName: "Emmanuel Johnson",
      tenantPhone: "+234 803 555 7865",
      amount: 150000,
      status: "cancelled",
      checkIn: "2025-09-12T00:00:00Z",
      checkOut: "2025-09-15T00:00:00Z",
      platformFee: 5000,
      expiredDate: "2025-09-16T00:00:00Z",
    },
    {
      _id: "4",
      houseTitle: "Luxury Shortlet Apartment, Ikoyi",
      guestName: "Amaka Obi",
      tenantPhone: "+234 811 444 2200",
      amount: 850000,
      status: "draft",
      checkIn: "2025-11-01T00:00:00Z",
      checkOut: "2025-11-05T00:00:00Z",
      platformFee: 20000,
      expiredDate: "2025-11-04T00:00:00Z",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  // 🧠 Fetch bookings & payments (populated data from backend)
  const fetchBooking = async () => {
    try {
      setLoading(true);
      const bookingRes = await app.get(`${base}/v1/booking/${user._id}`);
      const bookingData = bookingRes.data;
      console.log("data", bookingData);
      // Add expiredDate logic (3 days after checkIn if not already present)

      setBooking(bookingData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchPayment = async () => {
    try {
      setLoading(true);

      const paymentRes = await app.get(
        `${base}/v1/booking/${user._id}?role=guest`
      );
      const paymentsData = paymentRes.data;
      console.log(paymentsData);
      setRecentPayments(paymentsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/register");
      return;
    }

    fetchBooking();
    fetchPayment();
  }, [_hasHydrated, isAuthenticated, router]);

  // 🧠 Approve booking logic
  const handleApprove = async (id: string, expiredDate: string) => {
    const now = new Date();
    const expiry = new Date(expiredDate);

    // If expired, confirm refund or approval
    if (expiry < now) {
      const confirmRefund = confirm(
        "This booking has expired. Would you like to refund the payment instead?"
      );
      if (confirmRefund) {
        router.push(`/refund?id=${id}`);
        return;
      } else {
        const approveAnyway = confirm(
          "Are you sure you want to approve this expired booking?"
        );
        if (!approveAnyway) return;
      }
    }

    try {
      const res = await fetch(`/api/bookings/${id}/approve`, {
        method: "PUT",
      });
      if (res.ok) {
        setBooking((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: "approved" } : b))
        );
        alert("Booking approved successfully!");
      } else {
        alert("Failed to approve booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving booking.");
    }
  };

  const handleRefund = (id: string) => {
    const confirmRefund = confirm(
      "Are you sure you want to issue a refund for this booking?"
    );
    if (confirmRefund) {
      router.push(`/refund?id=${id}`);
    }
  };

  async function getProperties() {
    try {
      const res = await app.get(`${base}/v1/house?hostId=${user._id}`);
      const data: Property[] = res.data.data;
      console.log(data);
      await setProperties(data);
      console.log(properties);
    } catch (err) {
      toast.error("an error occured");
    }
  }

  if (!user && !loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );

  return (
    <>
      <Header color="black" />
      <div className="min-h-screen bg-gray-50 md:pt-[60px] pt-[40px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback>
                        {user.userName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.userName}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {[
                      { name: "overview", link: "" },

                      { name: "booking", link: "" },

                      { name: "payment", link: "payments/history" },
                      { name: "messages", link: "" },

                      { name: "settings", link: "" },
                    ].map((tab) => (
                      <span key={tab.name}>
                        {tab.link ? (
                          <Link
                            key={tab.name}
                            href={tab.link}
                            // onClick={() => setLoading(true)}
                          >
                            <Button
                              key={tab.name}
                              variant={
                                activeTab === tab.name ? "default" : "ghost"
                              }
                              className="w-full justify-start"
                              onClick={() => setActiveTab(tab.name)}
                            >
                              {tab.name === "overview" && (
                                <Home className="h-4 w-4 mr-2" />
                              )}
                              {tab.name === "booking" && (
                                <House className="h-4 w-4 mr-2" />
                              )}
                              {tab.name === "payment" && (
                                <CreditCard className="h-4 w-4 mr-2" />
                              )}
                              {tab.name === "messages" && (
                                <MessageSquare className="h-4 w-4 mr-2" />
                              )}
                              {tab.name === "settings" && (
                                <Settings className="h-4 w-4 mr-2" />
                              )}
                              {tab.name.charAt(0).toUpperCase() +
                                tab.name.slice(1)}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            key={tab.name}
                            variant={
                              activeTab === tab.name ? "default" : "ghost"
                            }
                            className="w-full justify-start"
                            onClick={() => setActiveTab(tab.name)}
                          >
                            {tab.name === "overview" && (
                              <Home className="h-4 w-4 mr-2" />
                            )}
                            {tab.name === "booking" && (
                              <House className="h-4 w-4 mr-2" />
                            )}
                            {tab.name === "payment" && (
                              <CreditCard className="h-4 w-4 mr-2" />
                            )}
                            {tab.name === "messages" && (
                              <MessageSquare className="h-4 w-4 mr-2" />
                            )}
                            {tab.name === "settings" && (
                              <Settings className="h-4 w-4 mr-2" />
                            )}
                            {tab.name.charAt(0).toUpperCase() +
                              tab.name.slice(1)}
                          </Button>
                        )}
                      </span>
                    ))}
                    <Button
                      variant={activeTab === "editlist" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab("editlist");
                        getProperties();
                      }}
                    >
                      <Edit /> Edit listing
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "overview" && (
                <div>
                  <h1 className="text-2xl font-bold mb-4">
                    Welcome back, {user.userName.split(" ")[0]}!
                  </h1>
                  <Card className="gap-5">
                    <CardHeader>
                      <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-5">
                      {/* {!loading ? (
                        <>
                          {booking}
                          {booking?.length > 0 ? (
                            booking
                              .slice(0, 3)
                              .map((b, index) => (
                                <BookingCard key={index} booking={b} />
                              ))
                          ) : (
                            <p>No bookings yet.</p>
                          )}
                        </>
                      ) : (
                        <p>loading...</p>
                      )} */}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "booking" && (
                <div>
                  <h1 className="text-2xl font-bold mb-4">
                    Payment Management
                  </h1>
                  {booking.length ? (
                    booking.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        onApprove={() => handleApprove(b._id, b.expiredDate)}
                        onRefund={() => handleRefund(b._id)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        All caught up!
                      </h3>
                      <p className="text-gray-500">
                        No pending payment approvals
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "messages" && (
                <div>
                  <h1 className="text-2xl font-bold mb-4">Messages</h1>
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      No messages yet.
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h1 className="text-2xl font-bold mb-4">Settings</h1>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          if (confirm("Are you sure you want to logout?")) {
                            localStorage.clear();
                            logout();
                            router.push("/");
                          }
                        }}
                      >
                        Logout
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "editlist" && (
                <div className="min-h-screen ">
                  {/* Page Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      Edit Property
                    </h1>
                  </div>

                  {/* Tabs Section */}
                  <Card defaultValue="details" className="w-full gap-1">
                    {/* Details Tab */}
                    <CardContent className="p-7 flex flex-col gap-3">
                      {properties.length > 0 ? (
                        properties?.map((data) => {
                          return (
                            <EditablePropertyCard
                              getData={getProperties}
                              data={data}
                            />
                          );
                        })
                      ) : (
                        <div>no result</div>
                      )}
                    </CardContent>

                    {/* Map Tab */}
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

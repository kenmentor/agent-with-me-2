"use client";

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
  Calendar,
  Bell,
  Settings,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Eye,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState(3);
  const userData = useAuthStore((state) => state.user);
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      tenantName: "John Doe",
      tenantPhone: "+91 9876543210",
      propertyTitle: "2BHK Apartment in Bandra West",
      amount: 45000,
      lateFee: 0,
      totalAmount: 45000,
      paidDate: "2024-01-24",
      paidTime: "11:20:00",
      paidDateTime: "2024-01-24T11:20:00.000Z",
      method: "UPI",
      transactionId: "TXN987654321",
      status: "pending_approval",
      notes: "February rent payment",
      dueDate: "2024-02-25",
    },
    {
      id: 2,
      tenantName: "Jane Smith",
      tenantPhone: "+91 9876543211",
      propertyTitle: "1BHK Studio in Whitefield",
      amount: 25000,
      lateFee: 100,
      totalAmount: 25100,
      paidDate: "2024-01-25",
      paidTime: "15:45:00",
      paidDateTime: "2024-01-25T15:45:00.000Z",
      method: "Card",
      transactionId: "TXN987654322",
      status: "pending_approval",
      notes: "Late payment with fee",
      dueDate: "2024-01-25",
    },
  ]);

  const [recentPayments, setRecentPayments] = useState([
    {
      id: 1,
      tenantName: "John Doe",
      propertyTitle: "2BHK Apartment in Bandra West",
      amount: 45000,
      paidDate: "2024-01-23",
      paidTime: "14:30:00",
      approvedDate: "2024-01-24",
      approvedTime: "09:15:00",
      method: "UPI",
      transactionId: "TXN123456789",
      status: "approved",
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!userData || !isLoggedIn) {
      router.push("/auth/login");
      return;
    }
  }, [router]);

  const approvePayment = (paymentId: number) => {
    const payment = pendingApprovals.find((p) => p.id === paymentId);
    if (payment) {
      const now = new Date();
      const approvedPayment = {
        ...payment,
        status: "approved",
        approvedDate: now.toISOString().split("T")[0],
        approvedTime: now.toTimeString().split(" ")[0],
      };

      setRecentPayments((prev) => [approvedPayment, ...prev]);
      setPendingApprovals((prev) => prev.filter((p) => p.id !== paymentId));

      // Simulate notification to tenant
      alert(
        `Payment approved! Notification sent to ${payment.tenantName} at ${payment.tenantPhone}`
      );
    }
  };

  const rejectPayment = (paymentId: number) => {
    const payment = pendingApprovals.find((p) => p.id === paymentId);
    if (payment) {
      const reason = prompt("Please provide a reason for rejection:");
      if (reason) {
        setPendingApprovals((prev) => prev.filter((p) => p.id !== paymentId));
        alert(
          `Payment rejected. Notification sent to ${payment.tenantName} with reason: ${reason}`
        );
      }
    }
  };

  const contactTenant = (phone: string) => {
    alert(`Calling ${phone}...`);
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        {/* <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Agent with me
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>
                  {userData.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header> */}

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
                        {userData.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{userData.userName}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {userData.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <Button
                      variant={activeTab === "overview" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("overview")}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Overview
                    </Button>

                    <Button
                      variant={activeTab === "payments" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("payments")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {userData.role === "tenant"
                        ? "My Payments"
                        : "Payment Approvals"}
                      {userData.role === "landlord" &&
                        pendingApprovals.length > 0 && (
                          <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                            {pendingApprovals.length}
                          </Badge>
                        )}
                    </Button>

                    <Button
                      variant={activeTab === "messages" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </Button>

                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold">
                        Welcome back, {userData.userName.split(" ")[0]}!
                      </h1>
                      <p className="text-gray-600">
                        Here's what's happening with your account
                      </p>
                    </div>
                    {userData.role === "tenant" && (
                      <Link href="/payments/pay">
                        <Button>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Rent
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          {userData.role === "landlord"
                            ? "Pending Approvals"
                            : "Payment Status"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {userData.role === "landlord"
                            ? pendingApprovals.length
                            : "2"}
                        </div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {userData.role === "landlord"
                            ? "Payments to review"
                            : "Payments completed"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Messages
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          New messages
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₦45,000</div>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {userData.role === "landlord"
                            ? "Rent received"
                            : "Rent paid"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userData.role === "landlord" &&
                          pendingApprovals.length > 0 && (
                            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  New payment received
                                </p>
                                <p className="text-xs text-gray-500">
                                  From {pendingApprovals[0].tenantName} - ₦
                                  {pendingApprovals[0].totalAmount.toLocaleString()}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                Just now
                              </span>
                            </div>
                          )}

                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Payment approved
                            </p>
                            <p className="text-xs text-gray-500">
                              January rent payment processed
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            2 hours ago
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Payment notification sent
                            </p>
                            <p className="text-xs text-gray-500">
                              Reminder sent to landlord
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            1 day ago
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">
                      {userData.role === "tenant"
                        ? "My Payments"
                        : "Payment Management"}
                    </h1>
                    {userData.role === "tenant" && (
                      <Link href="/payments/pay">
                        <Button>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Rent
                        </Button>
                      </Link>
                    )}
                  </div>

                  {userData.role === "landlord" && (
                    <>
                      {/* Pending Approvals */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Pending Payment Approvals</span>
                            <Badge variant="secondary">
                              {pendingApprovals.length} pending
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Review and approve tenant payments with detailed
                            date/time information
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {pendingApprovals.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <h4 className="font-semibold">
                                      {payment.tenantName}
                                    </h4>
                                    <Badge variant="secondary">
                                      Pending Approval
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {payment.propertyTitle}
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                    <div>
                                      <p className="font-medium">
                                        Paid Date & Time
                                      </p>
                                      <p>{payment.paidDate}</p>
                                      <p className="text-xs">
                                        {payment.paidTime}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Method</p>
                                      <p>{payment.method}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        Transaction ID
                                      </p>
                                      <p className="text-xs font-mono">
                                        {payment.transactionId}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Contact</p>
                                      <p className="text-xs">
                                        {payment.tenantPhone}
                                      </p>
                                    </div>
                                  </div>
                                  {payment.notes && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                                      Notes: {payment.notes}
                                    </div>
                                  )}
                                  {payment.lateFee > 0 && (
                                    <div className="mt-1 text-xs text-red-600">
                                      Late fee included: ₦{payment.lateFee}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-600">
                                    ₦{payment.totalAmount.toLocaleString()}
                                  </p>
                                  <div className="flex flex-col space-y-2 mt-3">
                                    <Button
                                      size="sm"
                                      onClick={() => approvePayment(payment.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => rejectPayment(payment.id)}
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                      <AlertCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        contactTenant(payment.tenantPhone)
                                      }
                                    >
                                      <Phone className="h-4 w-4 mr-1" />
                                      Call
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {pendingApprovals.length === 0 && (
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
                        </CardContent>
                      </Card>

                      {/* Recent Approved Payments */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Recently Approved Payments</CardTitle>
                          <CardDescription>
                            Payments you've approved with approval date/time
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {recentPayments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <h4 className="font-semibold">
                                      {payment.tenantName}
                                    </h4>
                                    <Badge variant="default">Approved</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {payment.propertyTitle}
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                      <p className="font-medium">
                                        Paid Date & Time
                                      </p>
                                      <p>{payment.paidDate}</p>
                                      <p className="text-xs">
                                        {payment.paidTime}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        Approved Date & Time
                                      </p>
                                      <p>{payment.approvedDate}</p>
                                      <p className="text-xs">
                                        {payment.approvedTime}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        Transaction ID
                                      </p>
                                      <p className="text-xs font-mono">
                                        {payment.transactionId}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-600">
                                    ₦{payment.amount.toLocaleString()}
                                  </p>
                                  <div className="flex space-y-1 flex-col mt-2">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <Download className="h-4 w-4 mr-1" />
                                      Receipt
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {userData.role === "tenant" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Link href="/payments/pay">
                            <Button className="w-full h-20 flex-col">
                              <CreditCard className="h-6 w-6 mb-2" />
                              Pay Rent
                            </Button>
                          </Link>
                          <Link href="/payments/history">
                            <Button
                              variant="outline"
                              className="w-full h-20 flex-col bg-transparent"
                            >
                              <Eye className="h-6 w-6 mb-2" />
                              Payment History
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full h-20 flex-col bg-transparent"
                          >
                            <Download className="h-6 w-6 mb-2" />
                            Download Receipts
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Messages</h1>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No messages yet
                        </h3>
                        <p className="text-gray-500">
                          Payment notifications and communications will appear
                          here
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Notifications</CardTitle>
                      <CardDescription>
                        Manage how you receive payment notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500">
                            Receive SMS for payment updates
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">
                            Receive email for payment confirmations
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-approve Payments</p>
                          <p className="text-sm text-gray-500">
                            Automatically approve payments from verified tenants
                          </p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={() => {
                          if (confirm("Are you sure you want to logout?")) {
                            localStorage.removeItem("user");
                            localStorage.removeItem("isLoggedIn");
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

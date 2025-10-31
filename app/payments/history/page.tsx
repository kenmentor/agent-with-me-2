"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ArrowLeft,
  Eye,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";

type Payment = any; // keep 'any' for now — replace with proper type if available

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { base, app } = Req;

  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // helpers
  const formatCurrency = (n: number | null | undefined) =>
    typeof n === "number" ? `₦${n.toLocaleString()}` : "₦0";

  const formatDate = (d?: string | null) => {
    if (!d) return "N/A";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString();
    } catch {
      return d;
    }
  };

  // fetch payments
  const getData = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await app.get(`${base}/v1/payment/${user._id}`);
      if (res?.data?.data) setPayments(res.data.data);
      else setPayments([]);
    } catch (err) {
      console.error("Fetch error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [app, base, user?._id]);

  // initial load & redirect
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    getData();
  }, [_hasHydrated, isAuthenticated, getData, router]);

  // filtered payments memoized
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (filterStatus !== "all" && payment?.status !== filterStatus)
        return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inTitle = payment?.propertyTitle?.toLowerCase().includes(q);
        const inTx = payment?.paymentRef?.toLowerCase().includes(q);
        if (!inTitle && !inTx) return false;
      }

      if (filterYear !== "all") {
        const paidDate = payment?.paidDate;
        if (!paidDate || !paidDate.includes(filterYear)) return false;
      }

      if (filterMonth !== "all") {
        const paidDate = payment?.paidDate;
        if (!paidDate) return false;
        const paymentMonth = new Date(paidDate).getMonth() + 1;
        if (paymentMonth.toString() !== filterMonth) return false;
      }

      return true;
    });
  }, [payments, filterStatus, searchQuery, filterYear, filterMonth]);

  const totalPaid = useMemo(
    () =>
      filteredPayments
        .filter((p) => p.status === "success")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [filteredPayments]
  );

  // small UI helpers
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending_approval":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "success":
        return "success";
      case "pending_approval":
        return "Pending Approval";
      case "pending":
        return "Pending payment";
      case "failed":
        return "Rejected";
      default:
        return status || "Unknown";
    }
  };

  const getStatusVariant = (status: string | undefined) => {
    switch (status) {
      case "success":
        return "default";
      case "pending_approval":
        return "secondary";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const sendReminder = (payment: Payment) => {
    // Replace with real API call if needed
    alert(
      `Reminder sent to ${payment.landlordName} at ${payment.landlordPhone}`
    );
  };

  const downloadReceipt = (payment: Payment) => {
    const receiptData = `
GHAR KONNECT - Payment Receipt
==============================
Transaction ID: ${payment.paymentRef || "N/A"}
Property: ${payment.propertyTitle || "N/A"}
Landlord: ${payment.landlordName || "N/A"}
Amount: ${payment.amount ? formatCurrency(payment.amount) : "N/A"}
Payment Date: ${payment.paidDate || "N/A"}
Payment Time: ${payment.paidTime || "N/A"}
Method: ${payment.method || "N/A"}
Status: ${getStatusText(payment.status)}
${
  payment.successDate
    ? `success: ${payment.successDate} at ${payment.successTime}`
    : ""
}
    `;
    const blob = new Blob([receiptData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.paymentRef || Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI
  if (!user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user && !loading) {
    // If no user after hydration/redirect logic, just show a message
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Agent with me
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            Track all your rent payments with detailed date/time information
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Paid
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">success</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {payments.filter((p) => p.status === "success").length}
                  </p>
                </div>
                <Receipt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      payments.filter((p) => p.status === "pending_approval")
                        .length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Year</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {
                      payments.filter((p) => p.paidDate?.includes("2024"))
                        .length
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    aria-label="Search payments"
                    placeholder="Search by property or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">success</SelectItem>
                  <SelectItem value="pending_approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="pending">Pending payment</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  // implement export if desired
                  alert("Export not implemented yet");
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              {filteredPayments.length} transactions found
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading payments...
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No payments found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap">
                          {getStatusIcon(payment.status)}
                          <h4 className="font-semibold">
                            {payment.propertyTitle}
                          </h4>
                          <Badge variant={getStatusVariant(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <p className="font-medium">Paid Date & Time</p>
                            <p>
                              {payment.paidDate
                                ? formatDate(payment.paidDate)
                                : "Not paid"}
                            </p>
                            {payment.paidTime && (
                              <p className="text-xs">{payment.createdAt}</p>
                            )}
                          </div>

                          <div>
                            <p className="font-medium">Method</p>
                            <p>{payment.method || "N/A"}</p>
                          </div>

                          <div>
                            <p className="font-medium">Tenant</p>
                            <p>{payment.guest || "-"}</p>
                          </div>
                        </div>

                        {payment.paymentRef && (
                          <div className="mb-2 text-xs text-gray-500">
                            Transaction ID: {payment.paymentRef}
                          </div>
                        )}

                        {payment.successDate && (
                          <div className="mb-2 text-xs text-green-600">
                            success on: {payment.successDate} at{" "}
                            {payment.createdAt}
                          </div>
                        )}

                        {payment.notes && (
                          <div className="mb-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            Notes: {payment.notes}
                          </div>
                        )}
                      </div>

                      <div className="text-right w-48 flex-shrink-0">
                        <div className="text-2xl font-bold">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.lateFee > 0 && (
                          <div className="text-sm text-red-600">
                            (incl. ₦{payment?.lateFee} late fee)
                          </div>
                        )}

                        <div className="flex flex-col space-y-2 mt-2">
                          {payment?.status === "pending" && (
                            <Link href={`/payments/pay?id=${payment?.id}`}>
                              <Button size="sm" className="w-full">
                                Pay Now
                              </Button>
                            </Link>
                          )}

                          {payment?.status === "pending_approval" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendReminder(payment)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Remind
                            </Button>
                          )}

                          {payment?.status === "success" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReceipt(payment)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Receipt
                            </Button>
                          )}

                          {payment?.paymentRef && (
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

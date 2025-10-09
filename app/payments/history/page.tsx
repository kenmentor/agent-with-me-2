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

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("2024");
  const [filterMonth, setFilterMonth] = useState("all");

  const mockPaymentHistory = [
    {
      id: 1,
      propertyTitle: "2BHK Apartment in Bandra West",
      landlordName: "Rajesh Kumar",
      landlordPhone: "+91 9876543210",
      amount: 45000,
      lateFee: 0,
      totalAmount: 45000,
      dueDate: "2024-01-25",
      paidDate: "2024-01-23",
      paidTime: "14:30:00",
      paidDateTime: "2024-01-23T14:30:00.000Z",
      status: "approved",
      method: "UPI",
      transactionId: "TXN123456789",
      landlordApproved: true,
      approvedDate: "2024-01-24",
      approvedTime: "09:15:00",
      notes: "Monthly rent payment",
      tenantName: "John Doe",
    },
    {
      id: 2,
      propertyTitle: "2BHK Apartment in Bandra West",
      landlordName: "Rajesh Kumar",
      landlordPhone: "+91 9876543210",
      amount: 45000,
      lateFee: 200,
      totalAmount: 45200,
      dueDate: "2023-12-25",
      paidDate: "2023-12-27",
      paidTime: "16:45:00",
      paidDateTime: "2023-12-27T16:45:00.000Z",
      status: "approved",
      method: "Card",
      transactionId: "TXN123456788",
      landlordApproved: true,
      approvedDate: "2023-12-28",
      approvedTime: "10:20:00",
      notes: "Late payment with fee",
      tenantName: "John Doe",
    },
    {
      id: 3,
      propertyTitle: "2BHK Apartment in Bandra West",
      landlordName: "Rajesh Kumar",
      landlordPhone: "+91 9876543210",
      amount: 45000,
      lateFee: 0,
      totalAmount: 45000,
      dueDate: "2024-02-25",
      paidDate: "2024-01-24",
      paidTime: "11:20:00",
      paidDateTime: "2024-01-24T11:20:00.000Z",
      status: "pending_approval",
      method: "UPI",
      transactionId: "TXN123456790",
      landlordApproved: false,
      approvedDate: null,
      approvedTime: null,
      notes: "February rent payment",
      tenantName: "John Doe",
    },
    {
      id: 4,
      propertyTitle: "2BHK Apartment in Bandra West",
      landlordName: "Rajesh Kumar",
      landlordPhone: "+91 9876543210",
      amount: 45000,
      lateFee: 0,
      totalAmount: 45000,
      dueDate: "2024-03-25",
      paidDate: null,
      paidTime: null,
      paidDateTime: null,
      status: "pending",
      method: null,
      transactionId: null,
      landlordApproved: false,
      approvedDate: null,
      approvedTime: null,
      notes: "",
      tenantName: "John Doe",
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!userData || !isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const filteredPayments = mockPaymentHistory.filter((payment) => {
    if (filterStatus !== "all" && payment.status !== filterStatus) return false;
    if (
      searchQuery &&
      !payment.propertyTitle
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (filterYear !== "all" && !payment.paidDate?.includes(filterYear))
      return false;
    if (filterMonth !== "all" && payment.paidDate) {
      const paymentMonth = new Date(payment.paidDate).getMonth() + 1;
      if (paymentMonth.toString() !== filterMonth) return false;
    }
    return true;
  });

  const totalPaid = filteredPayments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "pending_approval":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending_approval":
        return "Pending Approval";
      case "pending":
        return "Pending Payment";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending_approval":
        return "secondary";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const sendReminder = (payment: any) => {
    alert(
      `Reminder sent to ${payment.landlordName} at ${payment.landlordPhone}`
    );
  };

  const downloadReceipt = (payment: any) => {
    // Simulate receipt download
    const receiptData = `
GHAR KONNECT - PAYMENT RECEIPT
==============================
Transaction ID: ${payment.transactionId}
Property: ${payment.propertyTitle}
Landlord: ${payment.landlordName}
Amount: ₦${payment.totalAmount.toLocaleString()}
Payment Date: ${payment.paidDate}
Payment Time: ${payment.paidTime}
Method: ${payment.method}
Status: ${getStatusText(payment.status)}
${
  payment.approvedDate
    ? `Approved: ${payment.approvedDate} at ${payment.approvedTime}`
    : ""
}
    `;

    const blob = new Blob([receiptData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            Track all your rent payments with detailed date/time information
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Paid
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₦{totalPaid.toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      filteredPayments.filter((p) => p.status === "approved")
                        .length
                    }
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
                      filteredPayments.filter(
                        (p) => p.status === "pending_approval"
                      ).length
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
                      filteredPayments.filter((p) =>
                        p.paidDate?.includes("2024")
                      ).length
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending_approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="pending">Pending Payment</SelectItem>
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

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
            <CardDescription>
              {filteredPayments.length} transactions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
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
                          <p className="font-medium">Landlord</p>
                          <p>{payment.landlordName}</p>
                          <p className="text-xs">{payment.landlordPhone}</p>
                        </div>
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p>{payment.dueDate}</p>
                        </div>
                        <div>
                          <p className="font-medium">Paid Date & Time</p>
                          <p>{payment.paidDate || "Not paid"}</p>
                          {payment.paidTime && (
                            <p className="text-xs">{payment.paidTime}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Method</p>
                          <p>{payment.method || "N/A"}</p>
                        </div>
                      </div>

                      {payment.transactionId && (
                        <div className="mb-2 text-xs text-gray-500">
                          Transaction ID: {payment.transactionId}
                        </div>
                      )}

                      {payment.approvedDate && (
                        <div className="mb-2 text-xs text-green-600">
                          Approved on: {payment.approvedDate} at{" "}
                          {payment.approvedTime}
                        </div>
                      )}

                      {payment.notes && (
                        <div className="mb-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                          Notes: {payment.notes}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ₦{payment.totalAmount.toLocaleString()}
                      </div>
                      {payment.lateFee > 0 && (
                        <div className="text-sm text-red-600">
                          (incl. ₦{payment.lateFee} late fee)
                        </div>
                      )}
                      <div className="flex flex-col space-y-2 mt-2">
                        {payment.status === "pending" && (
                          <Link href={`/payments/pay?id=${payment.id}`}>
                            <Button size="sm" className="w-full">
                              Pay Now
                            </Button>
                          </Link>
                        )}

                        {payment.status === "pending_approval" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendReminder(payment)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Remind
                          </Button>
                        )}

                        {payment.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReceipt(payment)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                        )}

                        {payment.transactionId && (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No payments found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

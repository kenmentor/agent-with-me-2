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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Receipt,
  Calendar,
  Clock,
  Send,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function PayRentPage() {
  const { houseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id");

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation, 4: Success
  const [isEditing, setIsEditing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    propertyTitle: "2BHK Apartment in Bandra West",
    landlordName: "Rajesh Kumar",
    landlordPhone: "+91 9876543210",
    amount: 45000,
    dueDate: "2024-02-25",
    lateFee: 0,
    totalAmount: 45000,
    paymentMethod: "",
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
    bankName: "",
    notes: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  const [paymentResult, setPaymentResult] = useState({
    transactionId: "",
    paidDateTime: "",
    status: "pending_approval",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!userData || !isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));

    // Calculate late fee if overdue
    const today = new Date();
    const dueDate = new Date(paymentData.dueDate);
    if (today > dueDate) {
      const daysLate = Math.ceil(
        (today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)
      );
      const lateFee = Math.min(daysLate * 100, 2000); // ₦100 per day, max ₦2000
      setPaymentData((prev) => ({
        ...prev,
        lateFee,
        totalAmount: prev.amount + lateFee,
      }));
    }
  }, [router]);

  const validatePaymentDetails = () => {
    if (!paymentData.paymentMethod) return false;

    if (paymentData.paymentMethod === "upi" && !paymentData.upiId) return false;

    if (paymentData.paymentMethod === "card") {
      if (
        !paymentData.cardNumber ||
        !paymentData.cardExpiry ||
        !paymentData.cardCvv ||
        !paymentData.cardName
      ) {
        return false;
      }
    }

    if (paymentData.paymentMethod === "netbanking" && !paymentData.bankName)
      return false;

    return true;
  };

  const handlePayment = async () => {
    setIsLoading(true);

    // Simulate payment processing with real-time updates
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const now = new Date();
    const transactionId = `TXN${Date.now()}`;
    const paidDateTime = now.toISOString();

    setPaymentResult({
      transactionId,
      paidDateTime,
      status: "pending_approval",
    });

    // Store payment record with detailed information
    const paymentRecord = {
      id: Date.now(),
      propertyTitle: paymentData.propertyTitle,
      landlordName: paymentData.landlordName,
      landlordPhone: paymentData.landlordPhone,
      amount: paymentData.amount,
      lateFee: paymentData.lateFee,
      totalAmount: paymentData.totalAmount,
      dueDate: paymentData.dueDate,
      paidDate: now.toISOString().split("T")[0],
      paidTime: now.toTimeString().split(" ")[0],
      paidDateTime: paidDateTime,
      method: paymentData.paymentMethod,
      transactionId,
      status: "pending_approval",
      landlordApproved: false,
      approvedDate: null,
      approvedTime: null,
      notes: paymentData.notes,
      tenantId: user.id,
      tenantName: user.name,
      tenantPhone: user.phone,
      createdAt: paidDateTime,
    };

    // Save to localStorage (in real app, send to backend)
    const existingPayments = JSON.parse(
      localStorage.getItem("userPayments") || "[]"
    );
    existingPayments.push(paymentRecord);
    localStorage.setItem("userPayments", JSON.stringify(existingPayments));

    // Also add to pending approvals for landlord
    const pendingApprovals = JSON.parse(
      localStorage.getItem("pendingApprovals") || "[]"
    );
    pendingApprovals.push(paymentRecord);
    localStorage.setItem("pendingApprovals", JSON.stringify(pendingApprovals));

    setIsLoading(false);
    setPaymentStep(4);
  };

  const sendPaymentNotification = () => {
    // Simulate sending notification to landlord
    alert(
      `Payment notification sent to ${paymentData.landlordName} at ${paymentData.landlordPhone}`
    );
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= paymentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < paymentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-20 h-1 mx-4 ${
                      step < paymentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-12 mt-2 text-sm text-gray-600">
            <span>Details</span>
            <span>Payment</span>
            <span>Confirm</span>
            <span>Success</span>
          </div>
        </div>

        {/* Step 1: Payment Details */}
        {paymentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Rent Payment Details
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? "Save" : "Edit"}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Review and edit your rent payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Info */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600 mt-1" />
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={paymentData.propertyTitle}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              propertyTitle: e.target.value,
                            })
                          }
                          placeholder="Property Title"
                        />
                        <Input
                          value={paymentData.landlordName}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              landlordName: e.target.value,
                            })
                          }
                          placeholder="Landlord Name"
                        />
                        <Input
                          value={paymentData.landlordPhone}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              landlordPhone: e.target.value,
                            })
                          }
                          placeholder="Landlord Phone"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg">
                          {paymentData.propertyTitle}
                        </h3>
                        <p className="text-gray-600">
                          Landlord: {paymentData.landlordName}
                        </p>
                        <p className="text-gray-600">
                          Phone: {paymentData.landlordPhone}
                        </p>
                      </>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {paymentData.dueDate}
                      </span>
                      {paymentData.lateFee > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Payment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Rent</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) => {
                            const amount = Number.parseInt(e.target.value) || 0;
                            setPaymentData({
                              ...paymentData,
                              amount,
                              totalAmount: amount + paymentData.lateFee,
                            });
                          }}
                          className="w-32 text-right"
                        />
                      ) : (
                        <span>₦{paymentData.amount.toLocaleString()}</span>
                      )}
                    </div>
                    {paymentData.lateFee > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Late Fee</span>
                        <span>₦{paymentData.lateFee.toLocaleString()}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>₦{paymentData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Payment Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes for the landlord..."
                    value={paymentData.notes}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                {/* Schedule Payment */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Schedule Payment (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Date</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={paymentData.scheduledDate}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            scheduledDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={paymentData.scheduledTime}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            scheduledTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Secure Payment</p>
                    <p className="text-green-700">
                      Your payment is secured with 256-bit SSL encryption. Your
                      landlord will be notified once payment is completed and
                      will approve it within 24-48 hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setPaymentStep(2)} size="lg">
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {paymentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
                <CardDescription>
                  Select your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentData.paymentMethod === "upi"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setPaymentData({ ...paymentData, paymentMethod: "upi" })
                    }
                  >
                    <div className="text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">UPI</h3>
                      <p className="text-sm text-gray-600">Pay using UPI ID</p>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentData.paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setPaymentData({ ...paymentData, paymentMethod: "card" })
                    }
                  >
                    <div className="text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Credit/Debit Card</h3>
                      <p className="text-sm text-gray-600">
                        Visa, Mastercard, RuPay
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentData.paymentMethod === "netbanking"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setPaymentData({
                        ...paymentData,
                        paymentMethod: "netbanking",
                      })
                    }
                  >
                    <div className="text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Net Banking</h3>
                      <p className="text-sm text-gray-600">All major banks</p>
                    </div>
                  </div>
                </div>

                {/* UPI Form */}
                {paymentData.paymentMethod === "upi" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID *</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@paytm / yourname@gpay"
                        value={paymentData.upiId}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            upiId: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Card Form */}
                {paymentData.paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        placeholder="Name as on card"
                        value={paymentData.cardName}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cardName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cardNumber: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date *</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={paymentData.cardExpiry}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cardExpiry: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV *</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={paymentData.cardCvv}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cardCvv: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentData.paymentMethod === "netbanking" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Your Bank *</Label>
                      <Select
                        value={paymentData.bankName}
                        onValueChange={(value) =>
                          setPaymentData({ ...paymentData, bankName: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sbi">
                            State Bank of India
                          </SelectItem>
                          <SelectItem value="hdfc">HDFC Bank</SelectItem>
                          <SelectItem value="icici">ICICI Bank</SelectItem>
                          <SelectItem value="axis">Axis Bank</SelectItem>
                          <SelectItem value="kotak">
                            Kotak Mahindra Bank
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Amount to Pay:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₦{paymentData.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaymentStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setPaymentStep(3)}
                disabled={!validatePaymentDetails()}
                size="lg"
              >
                Review Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {paymentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Confirm Payment Details</CardTitle>
                <CardDescription>
                  Please review all details before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Property Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Property:</span>
                        <span className="font-medium">
                          {paymentData.propertyTitle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Landlord:</span>
                        <span className="font-medium">
                          {paymentData.landlordName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Due Date:</span>
                        <span className="font-medium">
                          {paymentData.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-medium capitalize">
                          {paymentData.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">
                          ₦{paymentData.amount.toLocaleString()}
                        </span>
                      </div>
                      {paymentData.lateFee > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Late Fee:</span>
                          <span className="font-medium">
                            ₦{paymentData.lateFee.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₦{paymentData.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentData.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {paymentData.notes}
                    </p>
                  </div>
                )}

                {/* Current Date/Time Display */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">
                      Payment Date & Time
                    </h4>
                  </div>
                  <p className="text-blue-700">
                    {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPaymentStep(2)}>
                Back
              </Button>
              <Button onClick={handlePayment} disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₦${paymentData.totalAmount.toLocaleString()}`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {paymentStep === 4 && (
          <div className="text-center space-y-6">
            <Card>
              <CardContent className="pt-6">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your rent payment of ₦
                  {paymentData.totalAmount.toLocaleString()} has been processed
                  successfully.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">
                      {paymentResult.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Date:</span>
                    <span>
                      {new Date(
                        paymentResult.paidDateTime
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Time:</span>
                    <span>
                      {new Date(
                        paymentResult.paidDateTime
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">
                      {paymentData.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="secondary">Pending Landlord Approval</Badge>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-left">
                      <p className="font-medium text-blue-800">Next Steps:</p>
                      <p className="text-blue-700">
                        Your landlord ({paymentData.landlordName}) has been
                        notified about this payment. They will review and
                        approve it within 24-48 hours. You'll receive a
                        confirmation once approved.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={sendPaymentNotification}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder to Landlord
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Receipt className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Link href="/payments/history" className="flex-1">
                    <Button className="w-full">View Payment History</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

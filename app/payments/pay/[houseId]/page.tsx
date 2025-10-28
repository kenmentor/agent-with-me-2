"use client";
interface property {
  _id?: string;
  title: string;
  lga: string;
  country: string;
  description: string;
  views: number;
  rating: number;
  category: string;
  thumbnail: string;
  gallery: [{ url: string; type: string }];
  price: number;
  address: string;
  state: string;
  type: string;
  waterSuply: boolean;
  electricity: number;
  location: string;
  host: {
    _id: string;
    phoneNumber: number;
  };
  amenities: string[];
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
  View,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
import PayRentSkeleton from "@/components/PayRentSkeleton";

export default function PayRentPage() {
  const { houseId } = useParams();
  const router = useRouter();

  const { base, app } = Req;
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation, 4: Success
  const [isEditing, setIsEditing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    title: "2BHK Apartment in Bandra West",
    avaliable: true,

    host: {
      adminVerified: true,
      _id: "64a7f4c3e4b0f5b6c8d9e8f1",
      userName: "Rajesh Kumar",
      phoneNumber: 9876543210,
    },
    price: 45000,
    totalAmount: 45000,
    notes: "",
  });

  // const [property, setProperty] = useState<property | null>(null);
  // const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState({
    transactionId: "",
    paidDateTime: "",
    status: "pending_approval",
  });
  const [loading, setLoading] = useState(true);
  const [verifiedPayment, setVerifiedPayment] = useState({
    note: "",
    amount: 0.0,
    refund: 0.0,
    status: "pending",
    createdAt: "",
    method: "",

    paymentStatus: "",
  });
  async function getData() {
    try {
      const res = await app.get(`${base}/v1/house/detail/${houseId}`);
      const data = res.data.data;
      setPaymentData((prev) => ({ ...prev, data }));
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!_hasHydrated) return;

    // wait for Zustand to load from localStorage
    getData();
    console.log(paymentData);
    if (!isAuthenticated) {
      router.push("/auth/register");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Calculate late fee if overdue

  async function generatePaymentDetails() {
    console.log({
      email: user.email,
      hostId: paymentData?.host?._id,
      houseId: houseId,
      guestId: user._id,
      amount: paymentData?.totalAmount,
      notes: paymentData?.notes,
    });
    const paymentDetails = await app.post(
      `${base}/v1/payment/initialize-bank-transfer`,
      {
        email: user.email,
        hostId: paymentData?.host?._id,
        houseId: houseId,
        guestId: user._id,
        amount: paymentData?.price,
        notes: paymentData?.notes,
      }
    );
    console.log(paymentDetails.data.data.access_code);
    const popup = new PaystackPop();
    console.log();
    const access_code = paymentDetails.data.data.access_code;
    return popup.resumeTransaction(access_code);
  }
  const sendPaymentNotification = () => {
    // Simulate sending notification to landlord
    toast.success(
      `Payment notification sent to ${paymentData?.host?.userName} at ${paymentData?.host?.phoneNumber}`
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (loading) {
    return <PayRentSkeleton />;
  }
  if (!paymentData.avaliable) {
    return (
      <div>
        <h1>his house have just been rented </h1>
        <a href="/properties">go back to home </a>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-[100px]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="md:h-8 md:w-8 text-blue-600" />
              <span className="md:text-2xl font-bold text-gray-900">
                Agent with me
              </span>
            </Link>

            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="md:h-4 md:w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 ">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center ">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center  md:text-sm  font-medium ${
                    step <= paymentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < paymentStep ? (
                    <CheckCircle2 className=" md:h-5  md:w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={` md:w-20  md:h-1  md:ml-2 w-10 h-1 ${
                      step < paymentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center md:space-x-20 space-x-10 mt-2 text-[12px] md:text-sm  text-gray-600 ">
            <span>Details</span>
            <span>Payment</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Step 1: Payment Details */}
        {paymentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-[16px] md:text-[18px]">
                    <Receipt className="h-5 w-5 mr-2" />
                    Rent Payment Details
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <View className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardTitle>
                <CardDescription className="text-[12px]">
                  Review and edit your rent payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Info */}
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm md:text-lg ">
                      {paymentData?.title}
                    </h3>
                    <p className="text-gray-600">
                      {paymentData?.host?.userName}
                      host: {paymentData?.host?.userName}
                    </p>
                    <p className="text-gray-600">
                      Phone: {paymentData?.host?.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Payment Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Rent</span>
                      <span>
                        ₦{(paymentData?.price / 12)?.toLocaleString()}
                      </span>
                    </div>

                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>₦{paymentData?.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Payment Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes for the landlord..."
                    value={paymentData?.notes}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                  />
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

        {/* Step 3: Confirmation */}
        {paymentStep === 2 && (
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
                          {paymentData?.title}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>host:</span>
                        <span className="font-medium">
                          {paymentData?.host?.userName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">
                          ₦{paymentData?.price?.toLocaleString()}
                        </span>
                      </div>

                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>
                          ₦{paymentData?.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentData?.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {paymentData?.notes}
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
              <Button variant="outline" onClick={() => setPaymentStep(1)}>
                Back
              </Button>
              <Button
                // onClick={generatePaymentDetails}
                onClick={() => setPaymentStep(3)}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Payment Details.
                  </>
                ) : (
                  "Select Payment Method"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {paymentStep === 3 && (
          <div className="text-center space-y-6">
            <Card>
              <CardContent className="pt-6">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your rent payment of ₦
                  {paymentData?.totalAmount.toLocaleString()} has been processed
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
                      {verifiedPayment?.method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="secondary">Pending Your Approval</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Note:</span>
                    <span className="capitalize">{verifiedPayment?.note}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inspection Date expires:</span>
                    <span className="capitalize">
                      {verifiedPayment?.createdAt}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-left">
                      <p className="font-medium text-blue-800">Next Steps:</p>
                      <p className="text-blue-700">
                        We have recieved your payment you are to you are to
                        inspect the house within 3 day to ensure you made a good
                        choice
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

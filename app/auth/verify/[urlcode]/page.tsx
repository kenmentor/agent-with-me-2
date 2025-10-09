"use client";

import Link from "next/link";

import type React from "react";

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
import { CheckCircle, Phone, Mail, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function VerifyPage() {
  const { urlCode } = useParams();
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [user, setUser] = useState<any>(null);
  const [verificationMethod, setVerificationMethod] = useState("email"); // phone or email
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const pendingVerification = localStorage.getItem("pendingVerification");

    if (!userData || !pendingVerification) {
      router.push("/auth/register");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (verificationCode.length === 6) {
      try {
        const response = await verifyEmail(verificationCode);
        console.log("Verification Response:", response);

        if (response.status === 200 || response?.data?.status === 200) {
        } else {
          toast.success("Verification failed.");
        }
      } catch (error) {
        console.error(
          "Verification error:",
          error?.response?.data?.message || error?.message
        );
        toast.error("An error occurred while verifying. Please try again.");
      }

      setIsVerified(true);

      // Update user verification status
      const updatedUser = { ...user, verified: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.removeItem("pendingVerification");

      setTimeout(() => {
        router.push("/properties");
      }, 2000);
    } else {
      alert("Please enter a valid 6-digit code");
    }

    setIsLoading(false);
  };

  const resendCode = async () => {
    setCountdown(30);
    // Simulate resend API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`Verification code sent to your ${verificationMethod}!`);
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Account Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Welcome to Agent with me ! Your account has been successfully
              verified.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationMethod === "phone" ? (
              <Phone className="h-12 w-12 text-blue-600" />
            ) : (
              <Mail className="h-12 w-12 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">Verify Your Account</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to your{" "}
            {verificationMethod === "phone" ? "phone number" : "email address"}
            <br />
            <strong>
              {verificationMethod === "phone" ? user.phone : user.email}
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Verification Method Toggle */}
          {/* <div className="flex space-x-2 mb-6">
            <Button
              type="button"
              variant={verificationMethod === "phone" ? "default" : "outline"}
              size="sm"
              onClick={() => setVerificationMethod("phone")}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Phone
            </Button>
            <Button
              type="button"
              variant={verificationMethod === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setVerificationMethod("email")}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div> */}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {/* Demo Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Demo Mode</p>
                  <p className="text-yellow-700">
                    Enter any 6-digit code to verify (e.g., 123456)
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={resendCode}
              disabled={countdown > 0}
              className="w-full"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/auth/register"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Registration
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function verifyEmail(verificationCode: string) {
  throw new Error("Function not implemented.");
}

"use client";

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
import { CheckCircle, Mail, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const urlCode = params.urlCode as string | undefined;
  const email = searchParams.get("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");
  
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (urlCode && urlCode.length >= 4) {
      setVerificationCode(urlCode);
      handleAutoVerify(urlCode);
    }
  }, [urlCode]);

  useEffect(() => {
    if (countdown > 0 && !isVerified) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isVerified]);

  const handleAutoVerify = async (code: string) => {
    if (code.length === 6) {
      setIsLoading(true);
      setError("");
      try {
        await verifyEmail(code);
        setIsVerified(true);
        toast.success("Email verified successfully!");
      } catch (err: any) {
        setError(err?.response?.data?.message || "Verification failed");
      }
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      await verifyEmail(verificationCode);
      setIsVerified(true);
      toast.success("Email verified successfully!");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid verification code. Please try again.");
    }

    setIsLoading(false);
  };

  const resendCode = async () => {
    setCountdown(30);
    toast.success("Verification code resent to your email!");
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Account Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Welcome to Agent with Me! Your account has been successfully verified.
            </p>
            <p className="text-sm text-gray-500 animate-pulse">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {email ? (
              <>We&apos;ve sent a verification code to <strong>{email}</strong></>
            ) : (
              <>Enter the 6-digit verification code from your email</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                className="text-center text-2xl tracking-widest h-14"
                maxLength={6}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?
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

          <div className="mt-6 pt-4 border-t">
            <Link
              href="/auth/login"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

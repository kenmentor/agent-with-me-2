"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { useAuthStore } from "@/store/authStore";
import { trackVerification } from "@/store/analyticsStore";
import Req from "@/app/utility/axois";
import { toast } from "sonner";

const { app, base } = Req;

function VerifyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlCode = (params?.urlcode as string) || "";
  const email = searchParams?.get("email") || "";
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");
  const [hasAttemptedVerify, setHasAttemptedVerify] = useState(false);
  
  const verifyEmail = useAuthStore((state) => state.verifyEmail);

  const verifyCode = async (code: string) => {
    if (!code || code.length < 4 || isLoading || isVerified || hasAttemptedVerify) return;
    
    setHasAttemptedVerify(true);
    setIsLoading(true);
    setError("");
    try {
      await verifyEmail(code);
      const user = useAuthStore.getState().user;
      trackVerification(user?._id || null, true);
      setIsVerified(true);
      toast.success("Email verified successfully!");
      setTimeout(() => router.push("/properties"), 2000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "";
      // If already verified, treat as success
      if (errorMsg.toLowerCase().includes("already verified")) {
        trackVerification(null, true);
        setIsVerified(true);
        toast.success("Email already verified!");
        setTimeout(() => router.push("/properties"), 2000);
      } else {
        trackVerification(null, false);
        setError(errorMsg || "Verification failed");
        setHasAttemptedVerify(false);
      }
    }
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found. Please go back and try again.");
      return;
    }

    setIsLoading(true);
    try {
      await app.post(`${base}/v1/verification/resend_verification`, { email });
      toast.success("Verification code resent to your email!");
      setCountdown(30);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend code");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (urlCode && !isVerified && !hasAttemptedVerify) {
      const code = urlCode.replace(/\D/g, "");
      setVerificationCode(code);
      
      if (code.length >= 4 && code.length <= 10) {
        verifyCode(code);
      }
    }
  }, [urlCode]);

  useEffect(() => {
    if (countdown > 0 && !isVerified) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isVerified]);

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
              <>We&apos;ve sent a verification code to <strong>{decodeURIComponent(email)}</strong></>
            ) : (
              <>Enter the verification code from your email</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); verifyCode(verificationCode); }} className="space-y-4">
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
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError("");
                }}
                className="text-center text-2xl tracking-widest h-14"
                maxLength={10}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading || verificationCode.length < 4}
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
              onClick={handleResendCode}
              disabled={countdown > 0 || isLoading}
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
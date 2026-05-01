"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Req from "@/app/utility/axios";

const { base, app } = Req;

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

function LoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

function PartnerApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: prefillEmail,
    phone: "",
    experience: "",
    licenseNumber: "",
    areas: [] as string[],
    motivation: "",
  });

  const handleStateToggle = (state: string) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.includes(state)
        ? prev.areas.filter(s => s !== state)
        : [...prev.areas, state],
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await app.post(`${base}/v1/agents/apply`, {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        yearsOfExperience: formData.experience,
        licenseNumber: formData.licenseNumber,
        areasOfOperation: formData.areas,
        motivation: formData.motivation,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
// console.error("Application error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to partner with us. We'll review your application and get back to you within 24-48 hours.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold ml-4">Partner Application</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Apply to Partner With Us</h2>
              <p className="text-sm text-gray-500">Join our network of verified agents</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Okonkwo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 801 234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  required
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License/Registration Number</Label>
              <Input
                id="license"
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="e.g., AR 12345"
              />
              <p className="text-xs text-gray-500">Optional but recommended for faster verification</p>
            </div>

            <div className="space-y-3">
              <Label>Areas of Operation *</Label>
              <div className="flex flex-wrap gap-2">
                {nigerianStates.map(state => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleStateToggle(state)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      formData.areas.includes(state)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
              {formData.areas.length > 0 && (
                <p className="text-sm text-gray-500">{formData.areas.length} area(s) selected</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Why do you want to partner with us?</Label>
              <Textarea
                id="motivation"
                rows={4}
                value={formData.motivation}
                onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                placeholder="Tell us about yourself and why you'd be a great partner..."
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.fullName || !formData.email || !formData.phone || formData.areas.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Building2 className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function PartnerApplicationPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <PartnerApplicationContent />
    </Suspense>
  );
}


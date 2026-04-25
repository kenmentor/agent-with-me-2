"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, Monitor, Globe, Trash2, Loader2, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Req from "@/app/utility/axois";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const { app, base } = Req;

interface Session {
  _id: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  ip?: string;
  lastActive: string;
  current?: boolean;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { _hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchSessions();
  }, [_hasHydrated, isAuthenticated, router]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await app.get(`${base}/v1/auth/sessions`);
      setSessions(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRemoving(sessionId);
    try {
      await app.delete(`${base}/v1/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      toast.success("Session revoked");
    } catch (err) {
      toast.error("Failed to revoke session");
    } finally {
      setRemoving(null);
    }
  };

  const getDeviceIcon = (device: string) => {
    const d = device?.toLowerCase() || "";
    if (d.includes("mobile") || d.includes("phone")) return <Smartphone className="h-5 w-5" />;
    if (d.includes("tablet")) return <Smartphone className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="pt-20 px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/account" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
            <p className="text-gray-500">Manage your logged in devices</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <LogIn className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session._id}
                className={`bg-white p-4 rounded-lg border ${session.current ? "border-green-500" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${session.current ? "bg-green-100" : "bg-gray-100"}`}>
                      {getDeviceIcon(session.device)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{session.browser || "Unknown Browser"}</h3>
                        {session.current && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            This device
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{session.os || "Unknown OS"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {session.ip && <span>{session.ip}</span>}
                        {session.location && <span>{session.location}</span>}
                        <span>Last active {new Date(session.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => revokeSession(session._id)}
                      disabled={removing === session._id}
                    >
                      {removing === session._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> If you see any unfamiliar devices, revoke them immediately and change your password.
          </p>
        </div>

        <div className="mt-8">
          <Button
            variant="destructive"
            className="w-full"
            onClick={async () => {
              try {
                await app.post(`${base}/v1/auth/logout-all`);
                toast.success("Logged out of all devices");
                window.location.href = "/auth/login";
              } catch (err) {
                toast.error("Failed to logout");
              }
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out of All Devices
          </Button>
        </div>
      </main>
    </div>
  );
}
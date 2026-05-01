"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Check, X, Eye, ArrowLeft, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Req from "@/app/utility/axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const { base, app } = Req;

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  yearsOfExperience: string;
  licenseNumber: string;
  areasOfOperation: string[];
  motivation: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user, _hasHydrated, isAuthenticated } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchApplications();
  }, [_hasHydrated, isAuthenticated, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await app.get(`${base}/v1/agents/applications`);
      setApplications(res.data?.data || []);
    } catch (err) {
// console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(id);
    try {
      await app.put(`${base}/v1/agents/applications/${id}`, { status });
      setApplications(prev =>
        prev.map(app =>
          app._id === id ? { ...app, status } : app
        )
      );
      setSelectedApp(null);
    } catch (err) {
// console.error("Error updating status:", err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredApps = filter === "all"
    ? applications
    : filter === "pending"
    ? applications.filter(a => a.status === "pending")
    : filter === "approved"
    ? applications.filter(a => a.status === "approved")
    : applications.filter(a => a.status === "rejected");

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Agent Applications</h1>
                <p className="text-sm text-gray-500">{applications.length} total applications</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as typeof filter)}
              className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map(app => (
              <div
                key={app._id}
                className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">
                      {app.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500">{app.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApp(app)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {app.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => updateStatus(app._id, "approved")}
                        disabled={updating === app._id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => updateStatus(app._id, "rejected")}
                        disabled={updating === app._id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-600">
                    {selectedApp.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedApp.name}</h3>
                  <p className="text-gray-500">{selectedApp.email}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${statusColors[selectedApp.status]}`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedApp.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{selectedApp.yearsOfExperience} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License</p>
                  <p className="font-medium">{selectedApp.licenseNumber || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applied</p>
                  <p className="font-medium">{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Areas of Operation</p>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.areasOfOperation?.map(area => (
                    <span key={area} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {selectedApp.motivation && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Motivation</p>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                    {selectedApp.motivation}
                  </p>
                </div>
              )}

              {selectedApp.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatus(selectedApp._id, "approved")}
                    disabled={updating === selectedApp._id}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => updateStatus(selectedApp._id, "rejected")}
                    disabled={updating === selectedApp._id}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


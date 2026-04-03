"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { Loader2, TrendingUp, Users, Eye, Heart, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { 
    overview, isLoading, fetchOverview, fetchTopProperties, fetchJourneys, 
    fetchPageVisits, fetchUserRegistration, fetchPageTimeline,
    fetchPropertyAnalytics, fetchUserEngagement, fetchConversionFunnel,
    topProperties, journeys, pageVisits, userRegistration, pageTimeline,
    propertyAnalytics, userEngagement, conversionFunnel
  } = useAnalyticsStore();
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    loadData();
  }, [_hasHydrated, isAuthenticated, user, router]);

  const loadData = async () => {
    await Promise.all([
      fetchOverview(parseInt(period)),
      fetchTopProperties(parseInt(period)),
      fetchJourneys(parseInt(period)),
      fetchPageVisits(parseInt(period)),
      fetchUserRegistration(parseInt(period)),
      fetchPageTimeline(parseInt(period)),
      fetchPropertyAnalytics(parseInt(period)),
      fetchUserEngagement(parseInt(period)),
      fetchConversionFunnel(parseInt(period)),
    ]);
  };

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === "admin") {
      loadData();
    }
  }, [period]);

  if (!_hasHydrated || isLoading || !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Signups",
      value: overview.totalSignups,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Unique Visitors",
      value: overview.uniqueVisitors,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Property Views",
      value: overview.propertyViews,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Property Likes",
      value: overview.propertyLikes,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const completionData = [
    { name: "Verified", value: overview.signupCompletionRate },
    { name: "Not Verified", value: 100 - overview.signupCompletionRate },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500">Track your application performance</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value || 0}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overview.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="signups" stroke="#3B82F6" strokeWidth={2} name="Signups" />
                  <Line type="monotone" dataKey="logins" stroke="#10B981" strokeWidth={2} name="Logins" />
                  <Line type="monotone" dataKey="pageViews" stroke="#8B5CF6" strokeWidth={2} name="Page Views" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Signup Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : "#E5E7EB"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-3xl font-bold text-green-600">{overview.signupCompletionRate}%</p>
                <p className="text-sm text-gray-500">Users verify their email</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Top Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProperties?.topViews?.slice(0, 5).map((item: any, index: any) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">Property {item._id || "Unknown"}</p>
                        <p className="text-sm text-gray-500">{item.views} views</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.views}</p>
                      <p className="text-xs text-gray-500">views</p>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-center py-4">No data yet</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Login Rate</p>
                <p className="text-2xl font-bold text-green-700">{overview.loginRate}%</p>
                <p className="text-xs text-green-600">of visitors log in</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Total Logins</p>
                <p className="text-2xl font-bold text-blue-700">{overview.totalLogins}</p>
                <p className="text-xs text-blue-600">in last {period} days</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">Email Verified</p>
                <p className="text-2xl font-bold text-purple-700">{overview.totalVerifications}</p>
                <p className="text-xs text-purple-600">users verified</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg">User Journeys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {journeys?.slice(0, 8).map((journey: any, index: any) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-mono truncate max-w-md">
                    {journey._id?.replace(/,/g, " → ") || "Direct visit"}
                  </p>
                  <span className="text-sm font-semibold text-gray-900">{journey.count}</span>
                </div>
              )) || <p className="text-gray-500 text-center py-4">No journey data yet</p>}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Page Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageVisits || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="page" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="totalVisits" fill="#3B82F6" name="Total Visits" />
                  <Bar dataKey="uniqueUsers" fill="#10B981" name="Unique Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">User Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userRegistration?.totalUsers || 0}</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={userRegistration?.dailyRegistrations || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" name="New Registrations" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Page Visits Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={pageTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} name="Visits" dot={false} />
                <Line type="monotone" dataKey="uniqueUsers" stroke="#10B981" strokeWidth={2} name="Unique Users" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Top Pages by Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pageVisits?.slice(0, 10).map((item: any, index: any) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.page || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{item.totalVisits} visits • {item.uniqueUsers} unique</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.avgDuration || 0}s</p>
                    <p className="text-xs text-gray-500">avg time</p>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">No page data yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Visitors</span>
                  <span className="font-bold">{conversionFunnel?.visitors || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="mx-4 text-green-600 font-bold text-sm">→ {conversionFunnel?.conversionRates?.visitorToSignup || 0}%</div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Signups</span>
                  <span className="font-bold">{conversionFunnel?.signups || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${conversionFunnel?.conversionRates?.visitorToSignup || 0}%` }} />
                </div>
              </div>
              <div className="mx-4 text-green-600 font-bold text-sm">→ {conversionFunnel?.conversionRates?.signupToLogin || 0}%</div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Logins</span>
                  <span className="font-bold">{conversionFunnel?.logins || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${conversionFunnel?.conversionRates?.signupToLogin || 0}%` }} />
                </div>
              </div>
              <div className="mx-4 text-green-600 font-bold text-sm">→ {conversionFunnel?.conversionRates?.loginToVerified || 0}%</div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Verified</span>
                  <span className="font-bold">{conversionFunnel?.verified || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${conversionFunnel?.conversionRates?.loginToVerified || 0}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Visitor → Property</p>
                <p className="text-xl font-bold text-blue-700">{conversionFunnel?.conversionRates?.visitorToPropertyView || 0}%</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">Property → Like</p>
                <p className="text-xl font-bold text-red-700">{conversionFunnel?.conversionRates?.propertyViewToLike || 0}%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600">Total Engaged</p>
                <p className="text-xl font-bold text-purple-700">{conversionFunnel?.propertyLikes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Analytics */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Property Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyAnalytics?.propertyViews?.slice(0, 5).map((item: any, index: any) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.propertyId || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{item.views} views</span>
                      <span className="text-xs text-gray-400">{item.uniqueUsers} users</span>
                    </div>
                  </div>
                ))}
                {(!propertyAnalytics?.propertyViews || propertyAnalytics.propertyViews.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No property data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Liked Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyAnalytics?.propertyLikes?.slice(0, 5).map((item: any, index: any) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.propertyId || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-red-600">{item.likes} likes</span>
                      <span className="text-xs text-gray-400">{item.uniqueLikers} users</span>
                    </div>
                  </div>
                ))}
                {(!propertyAnalytics?.propertyLikes || propertyAnalytics.propertyLikes.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No likes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Engagement */}
        <Card className="border-0 shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg">User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{userEngagement?.totalActiveUsers || 0}</p>
                <p className="text-sm text-blue-600">Active Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{userEngagement?.avgEngagement || 0}</p>
                <p className="text-sm text-green-600">Avg Engagement</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">
                  {userEngagement?.topUsers?.reduce((sum: number, u: any) => sum + (u.propertyViews || 0), 0) || 0}
                </p>
                <p className="text-sm text-purple-600">Total Property Views</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Top Engaged Users</p>
              {userEngagement?.topUsers?.slice(0, 5).map((item: any, index: any) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-600">{item.userId || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{item.propertyViews || 0} views</span>
                    <span>{item.propertyLikes || 0} likes</span>
                    <span className="font-medium text-green-600">Score: {item.engagementScore || 0}</span>
                  </div>
                </div>
              ))}
              {(!userEngagement?.topUsers || userEngagement.topUsers.length === 0) && (
                <p className="text-gray-500 text-center py-4">No engagement data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
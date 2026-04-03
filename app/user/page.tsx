"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Req from "@/app/utility/axois";
import { useRouter } from "next/navigation";
import { MapPin, Building2, Home } from "lucide-react";
const { app, base } = Req;

import { Loader2 } from "lucide-react";

interface Property {
  _id: string;
  title: string;
  thumbnail?: string;
  location: string;
  price: number;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
}

interface User {
  _id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  avatar?: string;
  profileImage?: string;
  properties?: Property[];
  propertyCount?: number;
}

export default function AllUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get users with role filter - agents and landlords only (exclude guests)
        const res = await app.get(`${base}/v1/user?rule=agent,landlord`);
        const allUsers = res.data.data || [];
        
        // Filter to only agents and landlords (exclude guests)
        const agents = allUsers.filter((u: User) => 
          u.role === "agent" || u.role === "landlord" || u.role === "host"
        );
        
        // For each agent/landlord, fetch their properties
        const usersWithProperties = await Promise.all(
          agents.map(async (user: User) => {
            try {
              const propRes = await app.get(`${base}/v1/house?hostId=${user._id}&limit=3`);
              const properties = propRes.data?.data || [];
              return { ...user, properties, propertyCount: properties.length || 0 };
            } catch {
              return { ...user, properties: [], propertyCount: 0 };
            }
          })
        );
        
        setUsers(usersWithProperties);
        setFiltered(usersWithProperties);
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filteredList = users.filter(
      (u) =>
        u.userName?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower)
    );
    setFiltered(filteredList);
  }, [search, users]);

  return (
    <motion.div
      className="p-6 min-h-screen bg-gray-50 text-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents & Landlords</h1>
          <p className="text-gray-500 mt-1">Browse property owners and their listings</p>
        </div>

        <div className="mt-4 md:mt-0">
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="w-64 pl-10 bg-white border-gray-200 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Agents</p>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === "agent").length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Landlords</p>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === "landlord" || u.role === "host").length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Showing</p>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin text-gray-600 w-8 h-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No agents or landlords found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((user) => (
            <motion.div
              key={user._id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Card Header with gradient */}
                <div className="h-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 relative">
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <img
                      src={
                        user.profileImage || user.avatar ||
                        `https://ui-avatars.com/api/?name=${user.userName}&background=111111&color=fff&size=128`
                      }
                      alt={user.userName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                </div>
                
                <CardHeader className="pt-12 pb-2 text-center">
                  <CardTitle className="text-lg font-bold text-gray-900">
                    {user.userName}
                  </CardTitle>
                  <p className="text-sm text-gray-500 truncate px-4">{user.email}</p>
                </CardHeader>
                
                <CardContent className="flex flex-col items-center gap-3 pb-4">
                  <div className="flex gap-2">
                    <Badge
                      className={`text-xs font-medium px-3 py-1 ${
                        user.role === "agent" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {user.role === "agent" ? "🏠 Agent" : "🏢 Landlord"}
                    </Badge>
                    <Badge className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600">
                      {user.propertyCount || 0} properties
                    </Badge>
                  </div>
                  
                  {/* Properties Preview */}
                  {user.properties && user.properties.length > 0 && (
                    <div className="w-full space-y-2 pt-2">
                      <p className="text-xs text-gray-500 font-medium text-left">Recent Listings:</p>
                      {user.properties.slice(0, 2).map((prop) => (
                        <div 
                          key={prop._id}
                          onClick={() => router.push(`/properties/${prop._id}`)}
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                            {prop.thumbnail ? (
                              <img src={prop.thumbnail} alt={prop.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{prop.title}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{prop.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(user.propertyCount || 0) > 2 && (
                        <p className="text-xs text-gray-500 text-center pt-1">
                          +{(user.propertyCount || 0) - 2} more properties
                        </p>
                      )}
                    </div>
                  )}
                  
                  {(user.propertyCount || 0) === 0 && (
                    <p className="text-sm text-gray-400 py-2">No properties listed yet</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
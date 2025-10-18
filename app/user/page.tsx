"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Req from "@/app/utility/axois";
const { app, base } = Req;

import { Loader2 } from "lucide-react";

interface User {
  _id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await app.get(`${base}/v1/user`);
        const data = res.data.data || [];
        setUsers(data);
        setFiltered(data);
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
      className="p-6 min-h-screen bg-white text-gray-800 transition-all"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          All Users
        </h1>

        <Input
          type="text"
          placeholder="Search users..."
          className="w-full md:w-1/3 bg-gray-100 border border-gray-300 text-gray-700 focus:ring-2 focus:ring-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin text-gray-600 w-8 h-8" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No users found matching “{search}”.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((user) => (
            <motion.div
              key={user._id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-gray-50 border border-gray-200 hover:border-gray-400 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-col items-center">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.userName}&background=111111&color=fff`
                    }
                    alt={user.userName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-400 shadow-sm"
                  />
                  <CardTitle className="mt-3 text-lg font-semibold text-center text-gray-800">
                    {user.userName}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-500 text-gray-600"
                  >
                    {user.role || "User"}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      user.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.status || "active"}
                  </Badge>
                  {user.phoneNumber && user.role == "host" && (
                    <p className="text-gray-500 text-xs mt-1">
                      📞 {user.phoneNumber}
                    </p>
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

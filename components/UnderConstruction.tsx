"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Construction } from "lucide-react";
import Link from "next/link";

export default function FeatureInProgressOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Actual UI (visible but blurred and disabled) */}
      <div className="pointer-events-none blur-sm select-none opacity-70">
        {children}
      </div>

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-center px-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Construction className="w-14 h-14 text-yellow-400 animate-pulse" />
        </motion.div>

        <motion.h1
          className="text-2xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🚧 We’re Still Working on This Feature
        </motion.h1>

        <motion.p
          className="text-gray-400 text-sm mb-6 max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          This section is under development. You can view what it’ll look like,
          but interactions are currently disabled. Feel free to contact us if
          you have any questions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="https://wa.me/2348123456789?text=Hi%20I%20want%20to%20ask%20about%20the%20upcoming%20feature"
            target="_blank"
          >
            <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Us on WhatsApp
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

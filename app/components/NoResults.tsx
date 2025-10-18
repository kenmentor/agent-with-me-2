"use client";

import React from "react";
import { motion } from "framer-motion";

interface NoResultsProps {
  message?: string;
  onClearFilters?: () => void;
  onRetry?: () => void;
  className?: string;
}

export default function NoResults({
  message = "No houses found matching your filters",
  onClearFilters,
  onRetry,
  className = "",
}: NoResultsProps) {
  return (
    <div
      className={`w-full flex min-h-[320px] items-center justify-center p-6 sm:p-12 bg-white text-black ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-3xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          {/* Animated Illustration: minimal black & gray theme */}
          <motion.svg
            width="200"
            height="160"
            viewBox="0 0 220 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto block"
          >
            <motion.g
              initial={{ scale: 0.95 }}
              animate={{ scale: [0.95, 1.02, 1.0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* House base */}
              <rect
                x="30"
                y="70"
                width="120"
                height="60"
                rx="8"
                fill="rgba(0,0,0,0.03)"
                stroke="rgba(0,0,0,0.2)"
              />

              {/* Roof */}
              <motion.path
                d="M24 78 L90 30 L156 78"
                stroke="rgba(0,0,0,0.6)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />

              {/* Door */}
              <motion.rect
                x="80"
                y="94"
                width="24"
                height="36"
                rx="3"
                fill="rgba(128,128,128,0.3)"
                initial={{ y: 98 }}
                animate={{ y: [98, 94, 96] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.g>

            {/* Magnifier */}
            <motion.g
              transform="translate(140,70)"
              initial={{ scale: 0.9, rotate: -8, x: 12 }}
              animate={{
                scale: [0.9, 1.05, 1.0],
                rotate: [-8, 5, 0],
                x: [12, 0, 6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="2.5"
                fill="rgba(128,128,128,0.05)"
              />
              <rect
                x="30"
                y="30"
                width="26"
                height="5"
                rx="2"
                transform="rotate(30 30 30)"
                fill="rgba(0,0,0,0.4)"
              />
            </motion.g>
          </motion.svg>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-lg sm:text-2xl font-semibold text-black"
        >
          {message}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          className="mt-2 text-sm text-gray-600 max-w-xl mx-auto"
        >
          Try clearing some filters or broadening your search to find more
          listings.
        </motion.p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <motion.button
            onClick={() => onClearFilters && onClearFilters()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-md bg-black text-white border border-gray-300 text-sm hover:bg-gray-900 transition"
          >
            Clear filters
          </motion.button>
        </div>
      </div>
    </div>
  );
}

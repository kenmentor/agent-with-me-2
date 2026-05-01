"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <span className="text-5xl font-bold text-red-500">404</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page may have been removed or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-8 text-center border-t border-gray-200">
        <Link 
          href="/" 
          className="text-gray-500 hover:text-gray-700 inline-flex items-center text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to homepage
        </Link>
      </div>
    </div>
  );
}

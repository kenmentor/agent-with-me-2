"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PayRentSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Stepper */}
      <div className="flex justify-center items-center space-x-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            {i < 3 && <Skeleton className="h-1 w-16" />}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-2/3 mb-3" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Section */}
          <div className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>

          {/* Button */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

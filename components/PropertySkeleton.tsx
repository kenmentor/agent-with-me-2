"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertySkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" /> {/* Thumbnail */}
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-1/2" /> {/* Location */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/4" /> {/* Price */}
          <Skeleton className="h-4 w-1/6" /> {/* Badge */}
        </div>
      </CardContent>
    </Card>
  );
}

import PropertyDetailClient from "./client";
import { PropertyDetailSkeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import api from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_ENV === "production" 
      ? "https://agentwithme.davidnwachukwu.workers.dev"
      : "http://localhost:3000";
  try {
    const res = await api.get(`/v1/house/detail/${id}`);
    const property = res.data.data;

    

    const imageUrl = `${baseUrl}/api/og-image?url=${encodeURIComponent(
      property?.thumbnail ||
        property?.gallery?.[0] ||
        `${baseUrl}/fallback-image.png`
    )}`;

    const title = property?.title || "Beautiful Property Listing";
    const description =
      property?.description ||
      "Discover this amazing property with great features and stunning design.";

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      openGraph: {
        type: "website",
        title,
        description,
        url: imageUrl,
        siteName: "Agent With Me",
        locale: "en_US",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Metadata generation failed:", error);
    return {
      title: "Property Not Found",
      description: "We couldn't load this property's details.",
    };
  }
}

function PropertyNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
        <p className="text-gray-600 mb-6">
          We couldn't find the property you're looking for. It may have been removed or the link is incorrect.
        </p>
        <a
          href="/properties"
          className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse Properties
        </a>
      </div>
    </div>
  );
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const res = await api.get(`/v1/house/detail/${id}`);
    const property = res.data?.data;
    
    if (!property) {
      console.log("Property not found for ID:", id);
      return <PropertyNotFound />;
    }

    // Increment view count (fire and forget)
    api.put(`/v1/house`, { id }).catch(() => {});

    return (
      <ErrorBoundary fallback={<PropertyDetailSkeleton />}>
        <PropertyDetailClient property={property} />
      </ErrorBoundary>
    );
  } catch (error: any) {
    console.error("Error loading property:", error?.response?.data || error?.message);
    return <PropertyNotFound />;
  }
}
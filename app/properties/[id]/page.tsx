// app/properties/[id]/page.tsx
import PropertyDetailClient from "./client";
import { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const res = await fetch(
    `https://agent-with-me-backend.onrender.com/v1/house/detail/${params.id}`,
    { cache: "no-store" }
  );
  const result = await res.json();
  const property = result.data;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

  return {
    title: property.title,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      url: `${baseUrl}/properties/${params.id}`,
      images: [
        {
          url: property.thumbnail || `${baseUrl}/fallback-image.png`,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description: property.description,
      images: [property.thumbnail || `${baseUrl}/fallback-image.png`],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const res = await fetch(
    `https://agent-with-me-backend.onrender.com/v1/house/detail/${params.id}`,
    { cache: "no-store" }
  );
  const result = await res.json();
  const property = result.data;

  return <PropertyDetailClient property={property} />;
}

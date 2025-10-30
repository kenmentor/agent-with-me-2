import PropertyDetailClient from "./client";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const res = await fetch(
      `https://agent-with-me-backend.onrender.com/v1/house/detail/${params.id}`,
      { cache: "no-store" }
    );

    const result = await res.json();
    const property = result.data;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
    const imageUrl =
      property?.thumbnail ||
      property?.gallery?.[0] ||
      `${baseUrl}/fallback-image.png`;

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
        url: `${baseUrl}/properties/${params.id}`,
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
      description: "We couldn’t load this property’s details.",
    };
  }
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

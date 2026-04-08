// app/property/[id]/layout.tsx
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_ENV === "production"
    ? "https://agent-with-me-backend.onrender.com"
    : "http://localhost:5036";

  try {
    const res = await fetch(
      `${baseUrl}/v1/house/detail/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        title: "Property Detail",
        description: "Explore this property",
      };
    }

    const property = await res.json();

    return {
      title: property?.data?.title || "Property Detail",
      description: property?.data?.description || "Explore this amazing property",
    };
  } catch (error) {
    return {
      title: "Property Detail",
      description: "Explore this property",
    };
  }
}

// 👇 This is required — it's what Next.js will render
export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

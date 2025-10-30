// app/property/[id]/layout.tsx
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const res = await fetch(
    `https://agent-with-me-backend.onrender.com/v1/house/detail/${params.id}`,
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
    title: property.name || "Property Detail",
    description: property.description || "Explore this amazing property",
    openGraph: {
      title: property.name,
      description: property.description,
      type: "website",
      url: `http://localhost:3000/property/${params.id}`,
      images: [
        {
          url: `http://localhost:3000/property/${params.id}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: property.name,
        },
      ],
    },
  };
}

// 👇 This is required — it's what Next.js will render
export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

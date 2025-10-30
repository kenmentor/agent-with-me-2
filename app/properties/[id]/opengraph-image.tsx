import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Property Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Mock Data — replace this with real property fetch logic
async function getPropertyData(id: string) {
  return {
    title: "Luxury Apartment in Lekki Phase 1",
    location: "Lagos, Nigeria",
    price: "₦350,000 / month",
    image: "https://yourcdn.com/properties/sample.jpg",
  };
}

export default async function Image({ params }: { params: { id: string } }) {
  const property = await getPropertyData(params.id);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "#0b0b0c",
          width: "100%",
          height: "100%",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
        }}
      >
        {/* Background Image */}
        <img
          src={property.image}
          alt={property.title}
          style={{
            objectFit: "cover",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.3,
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))",
          }}
        />

        {/* Text */}
        <div style={{ padding: "60px", zIndex: 10 }}>
          <h1
            style={{ fontSize: 60, fontWeight: "bold", marginBottom: "10px" }}
          >
            {property.title}
          </h1>
          <p style={{ fontSize: 32, color: "#d1d5db" }}>{property.location}</p>
          <p
            style={{
              fontSize: 40,
              fontWeight: "600",
              marginTop: "20px",
              color: "#10b981",
            }}
          >
            {property.price}
          </p>
        </div>

        {/* Brand Logo */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src="https://yourcdn.com/logo.png"
            alt="Brand"
            width={80}
            height={80}
            style={{ borderRadius: "20%" }}
          />
          <span style={{ fontSize: 28, fontWeight: "600" }}>YourCompany</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

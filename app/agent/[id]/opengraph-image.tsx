import { ImageResponse } from "next/og";
import Req from "@/app/utility/axios";
import { getDisplayName } from "@/lib/utils";

const { app, base } = Req;

export const alt = "Agent Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function getAgent(agentId: string) {
  try {
    const res = await app.get(`${base}/v1/user/${agentId}`);
    return res.data.data || null;
  } catch (error) {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);

  const name = getDisplayName(agent);
  const initials = agent?.firstName?.[0]?.toUpperCase() || agent?.userName?.[0]?.toUpperCase() || "?";
  
  const hasImage = agent?.profileImage || agent?.avatar;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e3a8a",
          background: "linear-gradient(to right, #1e3a8a, #1e40af)",
          fontFamily: "system-ui, sans-serif",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            color: "white",
            maxWidth: "800px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: hasImage ? "transparent" : "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              border: "4px solid rgba(255,255,255,0.3)",
              marginBottom: "24px",
              overflow: "hidden",
            }}
          >
            {hasImage ? (
              <img
                src={agent.profileImage || agent.avatar}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              initials
            )}
          </div>

          {/* Name */}
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            {name}
          </h1>

          {/* Agency */}
          {agent?.agencyName && (
            <p
              style={{
                fontSize: "24px",
                opacity: 0.8,
                marginBottom: "16px",
              }}
            >
              {agent.agencyName}
            </p>
          )}

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {agent?.adminVerified && (
              <span
                style={{
                  backgroundColor: "#22c55e",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                ✓ Verified
              </span>
            )}
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "9999px",
                fontSize: "18px",
              }}
            >
              Agent
            </span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: "20px",
              opacity: 0.7,
              marginTop: "32px",
            }}
          >
            View properties
          </p>
        </div>

        {/* Logo watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            fontSize: "16px",
            opacity: 0.5,
            color: "white",
          }}
        >
          agentwithme.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
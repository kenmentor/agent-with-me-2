import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgentWithMe",
    short_name: "agentwithme",
    description:
      "ths is the best app to rent house in nigeria with verified agent",
    start_url: "/properties",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/placeholder-logo.svg",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/placeholder-logo.svg",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

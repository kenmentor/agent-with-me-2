import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;
  const userAgent = req.headers["user-agent"] || "";

  if (!url || typeof url !== "string") {
    res.status(400).send("Missing image URL");
    return;
  }

  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    if (userAgent.includes("WhatsApp")) {
      // Resize for WhatsApp (recommended OG size 1200x630)
      const resized = await sharp(buffer)
        .resize({ width: 1200, height: 630, fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader(
        "Cache-Control",
        "s-maxage=86400, stale-while-revalidate=3600"
      );
      res.send(resized);
    } else {
      // Serve original image for all other platforms
      res.setHeader(
        "Content-Type",
        response.headers.get("content-type") || "image/jpeg"
      );
      res.setHeader(
        "Cache-Control",
        "s-maxage=86400, stale-while-revalidate=3600"
      );
      res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing image");
  }
}

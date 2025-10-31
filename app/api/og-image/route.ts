// app/api/og-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const userAgent = req.headers.get("user-agent") || "";

  if (!url) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());

    let output: Buffer;

    if (userAgent.includes("WhatsApp")) {
      // Resize for WhatsApp (recommended OG size 1200x630)
      output = await sharp(buffer)
        .resize({ width: 1200, height: 630, fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();
    } else {
      output = buffer;
    }

    return new NextResponse(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("Error processing image:", err);
    return NextResponse.json(
      { error: "Error processing image" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import arcjet, { shield, tokenBucket } from "@arcjet/next";

const ajPhoto = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 120,
      interval: "1h",
      capacity: 120, // More capacity for photos since pages load multiple images
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

// A curated list of 10 stunning, high-quality travel images from Unsplash to use as mock fallbacks
const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80", // Bangkok Temple
  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80", // Tokyo Street Night
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", // Paris Café / Eiffel
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Beach Resort
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", // Kyoto Temple
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", // Mountains Scenic
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80", // Rome Colosseum
  "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?w=800&q=80", // London City
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80", // Cafe interior
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"  // Nature Forest
];

export async function GET(req: NextRequest) {
  try {
    const decision = await ajPhoto.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return new NextResponse("Too many requests", { status: 429 });
      }
      return new NextResponse("Access Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");
    const key = process.env.GOOGLE_PLACES_API_KEY;

    if (!ref) {
      return new NextResponse("Missing 'ref' parameter", { status: 400 });
    }

    // FALLBACK IF NO GOOGLE API KEY OR IF USING MOCK REFERENCE
    if (!key || ref.startsWith("mock_photo_ref_")) {
      // Calculate a stable index based on the reference string
      const hash = [...ref].reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const photoIndex = Math.abs(hash) % MOCK_PHOTOS.length;
      const fallbackUrl = MOCK_PHOTOS[photoIndex];

      return NextResponse.redirect(fallbackUrl);
    }

    // Fetch the real photo from Google Places
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${key}`;
    const response = await fetch(photoUrl);

    if (!response.ok) {
      console.warn(`[Google Places Photo Proxy] Google API returned status ${response.status}. Redirecting to placeholder.`);
      return NextResponse.redirect(MOCK_PHOTOS[0]);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, must-revalidate", // Cache photo for 24 hours
      },
    });

  } catch (error) {
    console.error("[Google Places Photo Proxy Error]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

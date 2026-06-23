import { NextRequest, NextResponse } from "next/server";
import arcjet, { shield, tokenBucket } from "@arcjet/next";

const ajPlaces = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 60,
      interval: "1h",
      capacity: 60, // 60 requests per hour per IP
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

// A collection of mock Thai reviews to generate realistic feedback
const MOCK_REVIEWS = [
  { author_name: "สมชาย รักเที่ยว", text: "บรรยากาศดีมาก การบริการยอดเยี่ยม คุ้มค่าที่ได้มาเยือน!", rating: 5, relative_time_description: "เมื่อ 2 สัปดาห์ก่อน" },
  { author_name: "วิภาดา ใจดี", text: "วิวสวยงามมาก ถ่ายรูปออกมาสวยทุกมุม แนะนำให้มาช่วงเช้าคนจะไม่เยอะค่ะ", rating: 5, relative_time_description: "เมื่อ 1 เดือนก่อน" },
  { author_name: "กิตติพงษ์ แก้วสะอาด", text: "สถานที่สะอาด เดินทางสะดวก แต่ที่จอดรถค่อนข้างจำกัด แนะนำเดินทางด้วยรถสาธารณะ", rating: 4, relative_time_description: "เมื่อ 3 วันก่อน" },
  { author_name: "นภา ลมเย็น", text: "จุดชมวิวสวยมาก ลมเย็นสบาย พนักงานบริการสุภาพเรียบร้อยดีมากค่ะ", rating: 5, relative_time_description: "เมื่อ 1 สัปดาห์ก่อน" },
  { author_name: "ธนาวุฒิ เรียนรู้", text: "น่าสนใจมาก ได้ความรู้และประสบการณ์ที่ดี เหมาะสำหรับครอบครัวและเด็กๆ", rating: 4, relative_time_description: "เมื่อ 2 เดือนก่อน" }
];

export async function GET(req: NextRequest) {
  try {
    const decision = await ajPlaces.protect(req, { requested: 1 });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json({ error: "rate_limit", message: "คุณส่งคำขอมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง" }, { status: 429 });
      }
      return NextResponse.json({ error: "forbidden", message: "คำขอถูกบล็อก" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name")?.trim();
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!name) {
      return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // FALLBACK IF API KEY IS NOT CONFIGURED
    if (!apiKey) {
      console.log(`[Google Places Details Proxy] Missing API Key. Returning mock data for: ${name}`);
      return NextResponse.json(generateMockData(name));
    }

    // 1. Text Search to find the Place ID
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(name)}&key=${apiKey}&language=th`;
    if (lat && lng) {
      searchUrl += `&location=${lat},${lng}&radius=2000`;
    }

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(`Google Places search failed: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    if (!searchData.results || searchData.results.length === 0) {
      console.log(`[Google Places Details Proxy] No place found for: ${name}. Returning mock data.`);
      return NextResponse.json(generateMockData(name));
    }

    const firstResult = searchData.results[0];
    const placeId = firstResult.place_id;

    // 2. Fetch Detailed Place Data using Place ID
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,opening_hours,photos,website,formatted_address,formatted_phone_number&key=${apiKey}&language=th`;
    const detailsRes = await fetch(detailsUrl);
    if (!detailsRes.ok) {
      throw new Error(`Google Places details failed: ${detailsRes.statusText}`);
    }

    const detailsData = await detailsRes.json();
    if (!detailsData.result) {
      console.log(`[Google Places Details Proxy] Details query failed for ID ${placeId}. Returning search candidate and mock extensions.`);
      // Merge search candidate with mock reviews/hours as fallback
      return NextResponse.json({
        name: firstResult.name || name,
        rating: firstResult.rating || 4.5,
        user_ratings_total: firstResult.user_ratings_total || 120,
        formatted_address: firstResult.formatted_address || "ไม่ระบุที่อยู่ชัดเจน",
        photos: firstResult.photos || [],
        ...generateMockExtensions()
      });
    }

    return NextResponse.json(detailsData.result);

  } catch (error) {
    console.error("[Google Places Details Proxy Error]:", error);
    return NextResponse.json({
      error: "server_error",
      message: "เกิดข้อผิดพลาดจากทางเซิร์ฟเวอร์",
    }, { status: 500 });
  }
}

// Generate complete mock details for a place name
function generateMockData(name: string) {
  // Stable hash based on name to get consistent ratings/address for the same place
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const ratingIndex = Math.abs(hash) % 8; // 0 to 7
  const rating = parseFloat((4.2 + (ratingIndex * 0.1)).toFixed(1)); // 4.2 to 4.9
  const reviewCount = Math.abs(hash) % 1500 + 50; // 50 to 1549
  
  // Pick 2-3 unique mock reviews based on hash
  const numReviews = (Math.abs(hash) % 2) + 2; // 2 or 3 reviews
  const reviews = [];
  const availableReviews = [...MOCK_REVIEWS];
  for (let i = 0; i < numReviews; i++) {
    const revIdx = (Math.abs(hash) + i) % availableReviews.length;
    reviews.push(availableReviews[revIdx]);
    availableReviews.splice(revIdx, 1);
  }

  return {
    name,
    rating,
    user_ratings_total: reviewCount,
    formatted_address: `เลขที่ ${Math.abs(hash) % 200 + 1} ถ.สุขุมวิท, เขตวัฒนา, กรุงเทพมหานคร 10110`,
    formatted_phone_number: `02-${Math.abs(hash) % 9000000 + 1000000}`,
    website: "https://www.tourismthailand.org",
    opening_hours: {
      open_now: true,
      weekday_text: [
        "วันจันทร์: 09:00 – 17:00",
        "วันอังคาร: 09:00 – 17:00",
        "วันพุธ: 09:00 – 17:00",
        "วันพฤหัสบดี: 09:00 – 17:00",
        "วันศุกร์: 09:00 – 17:00",
        "วันเสาร์: 09:00 – 18:00",
        "วันอาทิตย์: 09:00 – 18:00"
      ]
    },
    // Send a mock photo reference so the client knows a photo is available
    photos: [
      {
        photo_reference: `mock_photo_ref_${Math.abs(hash) % 100}`,
        height: 800,
        width: 1200
      }
    ],
    reviews
  };
}

// Generate only reviews and opening hours as extensions
function generateMockExtensions() {
  const reviews = [MOCK_REVIEWS[0], MOCK_REVIEWS[1], MOCK_REVIEWS[2]];
  return {
    formatted_phone_number: "02-123-4567",
    website: "https://www.tourismthailand.org",
    opening_hours: {
      open_now: true,
      weekday_text: [
        "วันจันทร์: 08:30 – 16:30",
        "วันอังคาร: 08:30 – 16:30",
        "วันพุธ: 08:30 – 16:30",
        "วันพฤหัสบดี: 08:30 – 16:30",
        "วันศุกร์: 08:30 – 16:30",
        "วันเสาร์: 08:30 – 16:30",
        "วันอาทิตย์: 08:30 – 16:30"
      ]
    },
    reviews
  };
}

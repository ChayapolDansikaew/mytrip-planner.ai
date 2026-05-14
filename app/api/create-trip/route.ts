import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { api } from "@/convex/_generated/api";
import { ajAnonymous, ajFree } from "@/lib/arcjet";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    const decision = await ajAnonymous.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          {
            error: "rate_limit",
            message: "กรุณาเข้าสู่ระบบเพื่อสร้างทริป",
            action: "sign_in",
            limit: 1,
            resetTime: "เที่ยงคืน (00:00 น.)",
          },
          { status: 429 },
        );
      }

      if (decision.reason.isShield()) {
        return NextResponse.json(
          { error: "forbidden", message: "คำขอถูกบล็อก" },
          { status: 403 },
        );
      }
    }
  }

  if (userId) {
    const user = await fetchQuery(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user?.isPremium) {
      const decision = await ajFree.protect(req, {
        userId,
        requested: 1,
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return NextResponse.json(
            {
              error: "rate_limit",
              message: "คุณใช้โควตาสร้างทริปฟรีรายวันครบแล้ว (3 ทริป/วัน)",
              action: "upgrade",
              limit: 3,
              resetTime: "เที่ยงคืน (00:00 น.)",
            },
            { status: 429 },
          );
        }

        if (decision.reason.isShield()) {
          return NextResponse.json(
            { error: "forbidden", message: "คำขอถูกบล็อก" },
            { status: 403 },
          );
        }
      }
    }
  }

  try {
    const body = await req.json().catch(() => null);
    const destination =
      typeof body?.destination === "string" ? body.destination.trim() : "";
    const duration =
      typeof body?.duration === "string" || typeof body?.duration === "number"
        ? Number(body.duration)
        : 0;
    const budget = typeof body?.budget === "string" ? body.budget.trim() : "";
    const travelers =
      typeof body?.travelers === "string" ? body.travelers.trim() : "";

    if (
      !destination ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 30 ||
      !budget ||
      !travelers
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกรายละเอียดทริปให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const prompt = `
สร้างแผนการเดินทางแบบละเอียดสำหรับทริปต่อไปนี้:
- จุดหมายปลายทาง: ${destination}
- ระยะเวลา: ${duration} วัน
- งบประมาณ: ${budget}
- ผู้ร่วมเดินทาง: ${travelers}

ตอบกลับเป็น JSON object ที่ถูกต้องเท่านั้น ห้ามใส่ markdown ห้ามใส่ backticks และห้ามมีข้อความอื่นนอก JSON
ให้ใช้ key เป็นภาษาอังกฤษตามโครงสร้างด้านล่าง แต่ค่า string ทั้งหมดต้องเขียนเป็นภาษาไทยที่อ่านเป็นธรรมชาติ:
{
  "tripName": "string",
  "destination": "string",
  "duration": number,
  "budget": "string",
  "travelers": "string",
  "bestTimeToVisit": "string",
  "hotels": [
    {
      "name": "string",
      "address": "string",
      "price": "string",
      "rating": number,
      "description": "string",
      "coordinates": { "lat": number, "lng": number }
    }
  ],
  "itinerary": [
    {
      "day": number,
      "theme": "string",
      "places": [
        {
          "name": "string",
          "details": "string",
          "ticketPrice": "string",
          "timeToVisit": "string",
          "travelTime": "string",
          "coordinates": { "lat": number, "lng": number }
        }
      ]
    }
  ]
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const tripData = JSON.parse(clean);

    return NextResponse.json({ tripData }, { status: 200 });
  } catch (error) {
    console.error("Gemini generation error:", error);
    return NextResponse.json(
      {
        error: "generation_failed",
        message: "เกิดข้อผิดพลาดในการสร้างทริป กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 },
    );
  }
}

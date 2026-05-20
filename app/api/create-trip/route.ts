import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { ajAnonymous, ajFree } from "@/lib/arcjet";

function getCreateTripErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "เกิดข้อผิดพลาดในการสร้างทริป กรุณาลองใหม่อีกครั้ง";
  }

  const message = error.message.toLowerCase();

  if (message.includes("openai_api_key") || message.includes("api_key is missing")) {
    return "ยังไม่ได้ตั้งค่า OPENAI_API_KEY บน Vercel หรือ .env.local กรุณาเพิ่ม Environment Variable แล้ว Deploy ใหม่";
  }

  if (message.includes("arcjet_key")) {
    return "ยังไม่ได้ตั้งค่า ARCJET_KEY บน Vercel กรุณาเพิ่ม Environment Variable แล้ว Deploy ใหม่";
  }

  if (message.includes("convex") || message.includes("fetchquery")) {
    return "เชื่อมต่อ Convex ไม่สำเร็จ กรุณาตรวจสอบ NEXT_PUBLIC_CONVEX_URL, CONVEX_DEPLOYMENT และ Deploy Convex functions";
  }

  if (message.includes("api key") || message.includes("permission") || message.includes("unauthorized") || message.includes("401")) {
    return "OpenAI API key ไม่ถูกต้องหรือไม่มีสิทธิ์ใช้งาน กรุณาตรวจสอบ OPENAI_API_KEY";
  }

  if (message.includes("not found") || message.includes("not supported") || message.includes("model")) {
    return "โมเดล OpenAI ที่ใช้อยู่ไม่พร้อมใช้งาน กรุณาตรวจสอบความถูกต้องของชื่อโมเดล";
  }

  if (message.includes("fetch failed") || message.includes("network") || message.includes("timeout")) {
    return "เชื่อมต่อบริการ AI ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือเช็กสถานะ OpenAI API";
  }

  if (message.includes("quota") || message.includes("rate limit") || message.includes("429")) {
    return "โควตา OpenAI เต็มหรือถูกจำกัดชั่วคราว กรุณาลองใหม่ภายหลัง";
  }

  if (message.includes("json")) {
    return "AI ตอบกลับรูปแบบไม่ถูกต้อง กรุณาลองสร้างทริปใหม่อีกครั้ง";
  }

  return "สร้างทริปไม่สำเร็จจากฝั่งเซิร์ฟเวอร์ กรุณาตรวจสอบ Function Logs บน Vercel เพื่อดูรายละเอียดเพิ่มเติม";
}

export async function POST(req: NextRequest) {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const arcjetKey = process.env.ARCJET_KEY;

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    if (!arcjetKey) {
      throw new Error("ARCJET_KEY is missing");
    }

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

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = response.choices[0]?.message?.content;
    const clean = text ? text.trim() : "";

    if (!clean) {
      throw new Error("OpenAI returned empty response");
    }

    const tripData = JSON.parse(clean);

    return NextResponse.json({ tripData }, { status: 200 });
  } catch (error) {
    console.error("Create trip API error:", error);
    return NextResponse.json(
      {
        error: "generation_failed",
        message: getCreateTripErrorMessage(error),
      },
      { status: 500 },
    );
  }
}

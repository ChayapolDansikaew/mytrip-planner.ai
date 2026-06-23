import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const maxDuration = 60; // 60 seconds timeout limit for serverless functions

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

    const { userId, getToken } = await auth();

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
    const promptParam =
      typeof body?.prompt === "string" ? body.prompt.trim() : "";

    let destination = "";
    let duration = 0;
    let budget = "";
    let travelers = "";

    if (promptParam) {
      if (!promptParam) {
        return NextResponse.json(
          { error: "กรุณากรอกบรีฟรายละเอียดความต้องการสำหรับทริป" },
          { status: 400 },
        );
      }
    } else {
      destination =
        typeof body?.destination === "string" ? body.destination.trim() : "";
      duration =
        typeof body?.duration === "string" || typeof body?.duration === "number"
          ? Number(body.duration)
          : 0;
      budget = typeof body?.budget === "string" ? body.budget.trim() : "";
      travelers = typeof body?.travelers === "string" ? body.travelers.trim() : "";

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
    }

    let promptText = "";
    if (promptParam) {
      promptText = `
คุณคือผู้เชี่ยวชาญด้านการวางแผนการท่องเที่ยวระดับมืออาชีพ
กรุณาสร้างแผนการเดินทางแบบละเอียดตามความต้องการของลูกค้าในข้อความต่อไปนี้:
"${promptParam}"

กรุณาแปลงความต้องการนี้ออกมาเป็นข้อมูลและโครงสร้าง JSON ที่ถูกต้องสมบูรณ์
ตอบกลับเป็น JSON object ที่ถูกต้องเท่านั้น ห้ามใส่ markdown ห้ามใส่ backticks และห้ามมีข้อความอื่นนอก JSON
ให้ใช้ key เป็นภาษาอังกฤษตามโครงสร้างด้านล่าง แต่ค่า string ทั้งหมดต้องเขียนเป็นภาษาไทยที่อ่านเป็นธรรมชาติและน่าดึงดูดใจ:
{
  "tripName": "string (ชื่อทริปภาษาไทยที่สร้างสรรค์ เช่น ตะลุยคาเฟ่ชิคชิค ณ ปารีส)",
  "destination": "string (เมืองหรือประเทศจุดหมายปลายทางเป็นภาษาไทย)",
  "duration": number (จำนวนวันเดินทางเป็นตัวเลข เช่น 5 โดยดึงจากข้อความของลูกค้า หรือประมาณการตามความเหมาะสมตั้งแต่ 1-14 วัน)",
  "budget": "string (ระดับงบประมาณที่ตรงกับข้อความ เช่น ประหยัด, ปานกลาง, หรูหรา)",
  "travelers": "string (ผู้ร่วมเดินทาง เช่น คนเดียว, คู่รัก, ครอบครัว, กลุ่มเพื่อน)",
  "bestTimeToVisit": "string (ช่วงเวลาที่ดีที่สุดในการมาท่องเที่ยวที่นี่ เช่น ตุลาคม - เมษายน)",
  "hotels": [
    {
      "name": "string (ชื่อโรงแรมแนะนำ)",
      "address": "string (ที่อยู่โรงแรม)",
      "price": "string (งบประมาณราคา เช่น ~3,500 บาท/คืน)",
      "rating": number (คะแนนรีวิว 1.0 - 5.0 เช่น 4.5),
      "description": "string (คำอธิบายสั้นๆ เกี่ยวกับโรงแรมและจุดเด่น)",
      "coordinates": { "lat": number, "lng": number }
    }
  ],
  "itinerary": [
    {
      "day": number,
      "theme": "string (ธีมของวันนี้ในภาษาไทย เช่น วันแรกกับการชมสถาปัตยกรรมสุดอลังการ)",
      "places": [
        {
          "name": "string (ชื่อสถานที่ท่องเที่ยว ร้านอาหาร คาเฟ่ หรือจุดที่น่าสนใจ)",
          "details": "string (รายละเอียดที่ควรไปทำที่นี่ในภาษาไทย เช่น ถ่ายรูปมุมห้ามพลาด ชิมกาแฟ หรือเดินชมสวนดอกไม้)",
          "ticketPrice": "string (ค่าเข้าชมหรือค่าใช้จ่าย เช่น ฟรี หรือ 15 ยูโร)",
          "timeToVisit": "string (เวลาที่ควรไปเยือน เช่น 09:00 - 11:30 น.)",
          "travelTime": "string (เวลาเดินทางไปสถานที่ถัดไป เช่น เดินเท้า 5 นาที หรือ นั่งรถไฟ 10 นาที)",
          "coordinates": { "lat": number, "lng": number }
        }
      ]
    }
  ]
}
`;
    } else {
      promptText = `
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
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const chatModel = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
    const imageModel = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

    // Start image generation promise if destination is already known (Form mode)
    let imagePromise = null;
    if (destination) {
      imagePromise = openai.images.generate({
        model: imageModel,
        prompt: `A beautiful professional travel photography of ${destination}, high quality, scenic view, vibrant colors`,
        n: 1,
        size: "1024x1024",
      }).catch(err => {
        console.error("Failed to generate image in parallel:", err);
        return null;
      });
    }

    const response = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        {
          role: "user",
          content: promptText,
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

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (userId) {
      const token = await getToken({ template: "convex" });
      if (token) {
        convex.setAuth(token);
      }
    }
    let imageUrl = "";

    // Start image generation if we didn't start it in Form mode (Conversational mode)
    if (!imagePromise && (destination || tripData.destination)) {
      const imgDest = destination || tripData.destination;
      imagePromise = openai.images.generate({
        model: imageModel,
        prompt: `A beautiful professional travel photography of ${imgDest}, high quality, scenic view, vibrant colors`,
        n: 1,
        size: "1024x1024",
      }).catch(err => {
        console.error("Failed to generate image sequentially:", err);
        return null;
      });
    }

    if (imagePromise) {
      try {
        const imageResponse = await imagePromise;
        const tempUrl = imageResponse?.data?.[0]?.url;
        const b64Data = imageResponse?.data?.[0]?.b64_json;

        if (tempUrl || b64Data) {
          let arrayBuffer: ArrayBuffer | null = null;
          let contentType = "image/png";

          if (tempUrl) {
            const imgRes = await fetch(tempUrl);
            if (!imgRes.ok) {
              throw new Error(`Failed to fetch image from OpenAI: ${imgRes.statusText}`);
            }
            contentType = imgRes.headers.get("content-type") || "image/png";
            arrayBuffer = await imgRes.arrayBuffer();
          } else if (b64Data) {
            const buffer = Buffer.from(b64Data, "base64");
            arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
          }

          if (arrayBuffer) {
            const uploadUrl = await convex.mutation(api.trips.generateUploadUrl, {});
            const uploadRes = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": contentType },
              body: arrayBuffer,
            });
            if (!uploadRes.ok) {
              throw new Error(`Failed to upload image to Convex storage: ${uploadRes.statusText}`);
            }

            const { storageId } = await uploadRes.json();
            const permanentUrl = await convex.query(api.trips.getStorageUrl, { storageId });
            
            if (permanentUrl) {
              imageUrl = permanentUrl;
            }
          }
        }
      } catch (imgError) {
        console.error("Failed to generate or store image:", imgError);
        // ไม่บล็อกการสร้างทริปหากฟังก์ชันสร้างรูปล้มเหลว
      }
    }


    return NextResponse.json({ tripData, imageUrl }, { status: 200 });
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

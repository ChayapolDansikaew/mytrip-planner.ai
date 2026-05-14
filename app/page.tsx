"use client";

import { useState, type FormEvent } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarDays,
  Gem,
  Heart,
  Hotel,
  MapPinned,
  Plane,
  Play,
  Send,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import { Card } from "@/components/ui/card";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const quickActions = [
  { icon: Plane, label: "สร้างทริปใหม่" },
  { icon: Sparkles, label: "หาแรงบันดาลใจ" },
  { icon: Gem, label: "ค้นหา Hidden Gems" },
  { icon: MapPinned, label: "ออกแบบเส้นทางพิเศษ" },
];

const previewSteps = [
  { icon: Hotel, title: "เลือกที่พัก", copy: "แนะนำย่านและโรงแรมตามงบและสไตล์" },
  { icon: Utensils, title: "จังหวะมื้ออาหาร", copy: "จัดร้านอาหารตามเส้นทาง ไม่ต้องย้อนกลับ" },
  { icon: CalendarDays, title: "แผนรายวัน", copy: "เรียงลำดับเช้า บ่าย เย็น ให้เดินทางจริงได้" },
];

const destinations = [
  {
    city: "ปารีส, ฝรั่งเศส",
    title: "เดินเล่นเมืองศิลป์ หอไอเฟล ลูฟวร์ และคาเฟ่ริมถนน",
    background: "bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_72%_24%,rgba(255,63,120,0.42),transparent_20%),linear-gradient(145deg,#22d3ee_0%,#0ea5e9_48%,#b9f529_100%)]",
  },
  {
    city: "นิวยอร์ก, สหรัฐฯ",
    title: "พลังเมืองใหญ่ วิวตึกระฟ้า บรอดเวย์ และมื้อค่ำสุดพิเศษ",
    background: "bg-[radial-gradient(circle_at_74%_18%,rgba(185,245,41,0.5),transparent_22%),radial-gradient(circle_at_20%_72%,rgba(255,63,120,0.36),transparent_24%),linear-gradient(145deg,#60a5fa_0%,#06b6d4_46%,#9de9f4_100%)]",
  },
  {
    city: "โตเกียว, ญี่ปุ่น",
    title: "วัดเก่า ซากุระ ย่านสร้างสรรค์ และมื้อโอมากาเสะ",
    background: "bg-[radial-gradient(circle_at_66%_16%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_36%_34%,rgba(255,63,120,0.4),transparent_20%),linear-gradient(145deg,#7dd3fc_0%,#38bdf8_40%,#d5ff63_100%)]",
  },
  {
    city: "โรม, อิตาลี",
    title: "ประวัติศาสตร์ สถาปัตยกรรม คลาสสิก และไวน์ยามเย็น",
    background: "bg-[radial-gradient(circle_at_40%_18%,rgba(255,255,255,0.68),transparent_24%),radial-gradient(circle_at_78%_70%,rgba(185,245,41,0.54),transparent_24%),linear-gradient(145deg,#38bdf8_0%,#0ea5e9_44%,#ff6b95_100%)]",
  },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");

  async function handleCreateTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setStatusTone("error");
      setStatusMessage("กรุณาบอก AI ว่าต้องการทริปแบบไหนก่อนเริ่มวางแผน");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (response.status === 429) {
        alert("Daily limit reached. Upgrade to Premium.");
        setStatusTone("error");
        setStatusMessage("ถึงขีดจำกัดรายวันแล้ว อัปเกรดเป็น Premium");
        return;
      }

      if (!response.ok) {
        setStatusTone("error");
        setStatusMessage(
          data?.message ?? "ไม่สามารถสร้างทริปได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง",
        );
        return;
      }

      setStatusTone("success");
      setStatusMessage(data?.message ?? "เริ่มสร้างทริปให้แล้ว");
    } catch {
      setStatusTone("error");
      setStatusMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="top" className="relative isolate min-h-screen overflow-hidden bg-[#9de9f4] text-[#0f3a64] selection:bg-[#ff3f78]/20 selection:text-[#0f3a64]">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(255,255,255,0.92),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(185,245,41,0.38),transparent_24%),radial-gradient(circle_at_18%_84%,rgba(255,63,120,0.18),transparent_24%),linear-gradient(180deg,#c9f7ff_0%,#f7fcff_50%,#fff8ed_100%)]" />
        <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_25%,transparent_25%),linear-gradient(225deg,rgba(255,255,255,0.38)_25%,transparent_25%)] bg-[size:72px_72px] opacity-35" />
        <div className="absolute -left-28 top-36 h-80 w-80 rounded-full bg-[#ff3f78]/18 blur-3xl" />
        <div className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#b9f529]/38 blur-3xl" />
      </div>

      <SiteHeader />

      <motion.section initial={false} animate="visible" variants={stagger} className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-20 pt-20 text-center lg:px-8 lg:pt-28">
        <div className="flex w-full flex-col items-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-[#ff3f78] shadow-[0_18px_50px_rgba(15,58,100,0.1)] backdrop-blur-xl">
            <Star className="h-3.5 w-3.5 fill-[#ff3f78] text-[#ff3f78]" />
            ผู้ช่วยวางแผนทริปส่วนตัวด้วย AI
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#0f3a64] md:text-7xl lg:text-[5.2rem]">
            วางแผนทริปสดใสไปทั่ว <span className="text-[#ff3f78]">โลก</span> ในไม่กี่วินาที
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-8 text-[#0f3a64]/70 md:text-lg">
            บอก AI ว่าคุณอยากไปไหน ชอบสไตล์แบบไหน และมีงบเท่าไหร่ แล้วรับแผนเที่ยวที่อ่านง่าย สดใส และพร้อมออกเดินทางจริง
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 w-full max-w-3xl rounded-[1.6rem] border border-white/70 bg-white/45 p-3 text-left shadow-[0_34px_100px_rgba(15,58,100,0.16),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl">
            <form onSubmit={handleCreateTrip} className="flex min-h-28 items-start gap-4 rounded-[1.25rem] border border-white/75 bg-white/72 p-4">
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="บอก AI ว่าต้องการทริปแบบไหน" className="min-h-20 flex-1 resize-none bg-transparent text-sm leading-7 text-[#0f3a64] outline-none placeholder:text-[#0f3a64]/42" placeholder="เช่น สร้างทริปปารีส 5 วัน จากกรุงเทพฯ เน้นคาเฟ่ ศิลปะ โรงแรมสวย และงบกลาง ๆ" />
              <button type="submit" disabled={isSubmitting} className="mt-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff3f78] text-white shadow-[0_14px_38px_rgba(255,63,120,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95] disabled:pointer-events-none disabled:opacity-60" aria-label="ส่งบรีฟให้ AI">
                <Send className="h-4 w-4" />
              </button>
            </form>
            {statusMessage ? (
              <p aria-live="polite" className={`px-2 pt-3 text-sm font-medium ${statusTone === "error" ? "text-red-600" : "text-[#0f8f4b]"}`}>
                {statusMessage}
              </p>
            ) : null}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-5 flex flex-wrap justify-center gap-3">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-medium text-[#0f3a64]/72 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#ff3f78]/40 hover:bg-white/75 hover:text-[#0f3a64]">
                  <Icon className="h-3.5 w-3.5 text-[#ff3f78]" />
                  {item.label}
                </button>
              );
            })}
          </motion.div>

          <motion.a variants={fadeUp} href="#how-it-works" className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-[#0f3a64]/64 transition hover:text-[#ff3f78]">
            ยังไม่รู้จะเริ่มตรงไหน? <span className="font-semibold text-[#0f3a64]">ดูวิธีทำงาน</span>
            <ArrowDown className="h-4 w-4" />
          </motion.a>
        </div>
      </motion.section>

      <motion.section id="how-it-works" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-120px" }} variants={stagger} className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 lg:px-8">
        <motion.div variants={fadeUp} className="w-full rounded-[2rem] border border-white/70 bg-white/45 p-3 text-[#0f3a64] shadow-[0_40px_120px_rgba(15,58,100,0.14)] backdrop-blur-2xl">
          <div className="overflow-hidden rounded-[1.55rem] border border-white/75 bg-white/62">
            <div className="flex items-center justify-between border-b border-[#0f3a64]/10 px-5 py-3">
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff3f78]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#22d3ee]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#b9f529]" />
              </div>
              <div className="hidden h-6 w-56 rounded-full bg-[#0f3a64]/5 md:block" />
              <Bot className="h-4 w-4 text-[#0f3a64]/55" />
            </div>

            <div className="grid min-h-[20rem] md:grid-cols-[4.5rem_1fr_18rem]">
              <aside className="hidden border-r border-[#0f3a64]/10 bg-white/55 py-5 md:flex md:flex-col md:items-center md:gap-4">
                {[Sparkles, MapPinned, Heart, CalendarDays, Gem].map((Icon, index) => (
                  <span key={index} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9de9f4]/55 text-[#0f3a64]/72">
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </aside>

              <div className="p-6 text-left md:p-8">
                <p className="text-sm font-semibold text-[#ff3f78]">ถามฉันได้เลย</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#0f3a64] md:text-4xl">
                  อยากไปที่ไหน?
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#0f3a64]/62">
                  เริ่มจากประโยคเดียว เช่น “อยากไปญี่ปุ่น 7 วัน เน้นอาหารดี โรงแรมสวย และไม่เดินเหนื่อย” แล้วระบบจะจัดเป็นแผนที่อ่านง่ายทันที
                </p>

                <div className="mt-7 grid gap-3">
                  {previewSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[#0f3a64]/8">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b9f529]/35 text-[#0f3a64]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-[#0f3a64]">{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-[#0f3a64]/58">{step.copy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="m-5 flex min-h-72 items-end overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.72),transparent_25%),radial-gradient(circle_at_80%_18%,rgba(185,245,41,0.56),transparent_24%),linear-gradient(145deg,#38bdf8_0%,#0ea5e9_52%,#ff3f78_100%)] p-5 text-left text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]">
                <div>
                  <div className="mb-14 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#ff3f78] shadow-[0_18px_42px_rgba(15,58,100,0.18)]">
                    <Play className="ml-1 h-7 w-7 fill-[#ff3f78]" />
                  </div>
                  <p className="text-sm text-white/78">Travel Brightly</p>
                  <h3 className="mt-1 text-3xl font-semibold leading-tight tracking-[-0.035em]">
                    เดินทางแบบสนุกในจังหวะของคุณเอง
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section id="destinations" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-120px" }} variants={stagger} className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-2 lg:px-8">
        <motion.div variants={fadeUp} className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-[#ff3f78]">POPULAR DESTINATIONS</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0f3a64] md:text-5xl">
              จุดหมายยอดนิยมที่ควรลอง
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/45 text-[#0f3a64]/72 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/75 hover:text-[#ff3f78]" aria-label="เลื่อนซ้าย">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ff3f78]/25 bg-[#ff3f78] text-white shadow-[0_14px_40px_rgba(255,63,120,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95]" aria-label="เลื่อนขวา">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination, index) => (
            <motion.div key={destination.city} variants={fadeUp}>
              <Card className={`group relative min-h-[27rem] overflow-hidden border-white/70 bg-cover bg-center p-0 ${destination.background}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f3a64]/2 via-[#0f3a64]/8 to-[#0f3a64]/62" />
                <div className="relative flex h-full min-h-[27rem] flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{destination.city}</p>
                    <span className="rounded-full bg-white/24 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      0{index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-white drop-shadow-sm">
                      {destination.title}
                    </h3>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition group-hover:border-white/70 group-hover:bg-white/32">
                      ดูไอเดียทริป
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}

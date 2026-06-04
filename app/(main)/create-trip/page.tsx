"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";

import {
  BudgetSelector,
  type BudgetValue,
} from "@/components/create-trip/BudgetSelector";
import { DestinationInput } from "@/components/create-trip/DestinationInput";
import {
  TravelersSelector,
  type TravelersValue,
} from "@/components/create-trip/TravelersSelector";
import ErrorToast from "@/components/ui/ErrorToast";
import RateLimitBanner from "@/components/ui/RateLimitBanner";
import { api } from "@/convex/_generated/api";
import { fadeUp, motionEase, pressTap, springSnappy } from "@/lib/motion";

const initialFormData = {
  destination: "",
  duration: "",
  budget: "",
  travelers: "",
};

type GeneratedTripData = {
  tripName?: unknown;
} & Record<string, unknown>;

type CreateTripResponse = {
  tripData?: GeneratedTripData;
  error?: string;
  message?: string;
  action?: "upgrade" | "sign_in";
  limit?: number;
  resetTime?: string;
};

type SaveStep = "idle" | "generating" | "saving" | "redirecting";

const loadingMessages = [
  "กำลังค้นหาร้านอาหารที่คุณต้องลอง...",
  "กำลังเช็คสภาพอากาศปลายทาง...",
  "กำลังเลือกโรงแรมที่คุณจะชอบ...",
  "กำลังจัดตารางเวลาให้ลงตัว...",
  "กำลังหาจุดถ่ายรูปสวยๆ ให้คุณ...",
  "กำลังคำนวณงบประมาณเดินทาง...",
  "กำลังเตรียมแผนที่การเดินทาง...",
  "เกือบเสร็จแล้ว รอแป๊บนะ...",
];

type RateLimitError = {
  message: string;
  action: string;
  limit: number;
  resetTime: string;
};

async function readCreateTripResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as CreateTripResponse;
  }

  const text = await response.text().catch(() => "");

  return {
    error: "invalid_response",
    message:
      text.trim() ||
      "เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า Environment Variables",
  } satisfies CreateTripResponse;
}

export default function CreateTripPage() {
  const createTrip = useMutation(api.trips.createTrip);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const shouldReduceMotion = useReducedMotion();
  const isSaving = useRef(false);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] =
    useState<RateLimitError | null>(null);
  const [saveStep, setSaveStep] = useState<SaveStep>("idle");
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Rotate loading messages every 2.5s while generating
  useEffect(() => {
    if (saveStep !== "generating") {
      return;
    }
    setLoadingMsgIndex(0); // eslint-disable-line react-hooks/set-state-in-effect
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [saveStep]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, router, user]);

  const isFormValid = useMemo(() => {
    const duration = Number(formData.duration);

    return (
      formData.destination.trim().length > 0 &&
      Number.isInteger(duration) &&
      duration >= 1 &&
      duration <= 30 &&
      formData.budget.length > 0 &&
      formData.travelers.length > 0
    );
  }, [formData]);

  function updateFormData<Field extends keyof typeof formData>(
    field: Field,
    value: (typeof formData)[Field],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleGenerateTrip() {
    if (isSaving.current) {
      return;
    }

    const destination = formData.destination.trim();
    const duration = Number(formData.duration);

    if (
      !destination ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 30 ||
      !formData.budget ||
      !formData.travelers
    ) {
      setError("กรุณากรอกรายละเอียดทริปให้ครบถ้วนก่อนสร้างทริป");
      return;
    }

    if (!user?.id) {
      setError("กรุณาเข้าสู่ระบบก่อนสร้างทริป");
      return;
    }

    isSaving.current = true;
    setLoading(true);
    setError(null);
    setRateLimitError(null);
    setSaveStep("generating");
    let didRedirect = false;

    try {
      const res = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          duration,
          budget: formData.budget,
          travelers: formData.travelers,
        }),
      });

      const data = await readCreateTripResponse(res);

      if (res.status === 429) {
        if (data.action === "upgrade") {
          setRateLimitError({
            message:
              data.message ??
              "คุณใช้โควตาสร้างทริปฟรีรายวันครบแล้ว (3 ทริป/วัน)",
            action: data.action,
            limit: data.limit ?? 3,
            resetTime: data.resetTime ?? "เที่ยงคืน (00:00 น.)",
          });
        } else if (data.action === "sign_in") {
          router.push("/sign-in");
        } else {
          setError(data.message ?? data.error ?? "คุณใช้โควตารายวันครบแล้ว");
        }

        return;
      }

      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "สร้างทริปไม่สำเร็จ");
      }

      if (!data.tripData) {
        throw new Error("ไม่พบข้อมูลทริป");
      }

      setSaveStep("saving");

      const tripName =
        typeof data.tripData.tripName === "string"
          ? data.tripData.tripName
          : destination;

      let tripId: string;

      try {
        tripId = await createTrip({
          userId: user.id,
          destination,
          tripData: data.tripData,
          duration,
          budget: formData.budget,
          travelers: formData.travelers,
          tripName,
        });
      } catch (saveError) {
        console.error("Trip save error:", saveError);
        throw new Error(
          "สร้างแผนทริปสำเร็จแล้ว แต่บันทึกลงฐานข้อมูลไม่สำเร็จ กรุณาตรวจสอบ Convex Deployment",
        );
      }

      setSaveStep("redirecting");
      console.log("ทริปที่สร้างแล้ว:", data.tripData);
      didRedirect = true;
      router.push(`/view-trip/${tripId}`);
    } catch (err) {
      console.error("Trip generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      if (!didRedirect) {
        setLoading(false);
        setSaveStep("idle");
        isSaving.current = false;
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid || loading) {
      return;
    }

    await handleGenerateTrip();
  }

  if (!isLoaded) {
    return <LoadingSpinner label="กำลังเตรียมหน้าสร้างทริป..." />;
  }

  if (!user) {
    return <LoadingSpinner label="กำลังพาคุณไปเข้าสู่ระบบ..." />;
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#9de9f4] px-4 py-10 text-[#0f3a64] selection:bg-[#ff3f78]/20 selection:text-[#0f3a64] sm:px-6 lg:px-8 dark:bg-[#081d33] dark:text-[#e3fafc] dark:selection:bg-[#ff3f78]/20 dark:selection:text-[#e3fafc]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.88),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(185,245,41,0.32),transparent_24%),linear-gradient(180deg,#c9f7ff_0%,#f7fcff_48%,#fff8ed_100%)] dark:bg-[radial-gradient(circle_at_16%_12%,rgba(5,17,33,0.92),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(185,245,41,0.1),transparent_24%),linear-gradient(180deg,#051121_0%,#081d33_48%,#041a15_100%)]" />
        <div className="floating-blob absolute left-[-8rem] top-28 h-72 w-72 rounded-full bg-[#ff3f78]/16 dark:bg-[#ff3f78]/8 blur-3xl" />
        <div className="floating-blob-delayed absolute bottom-8 right-[-7rem] h-80 w-80 rounded-full bg-[#b9f529]/35 dark:bg-[#b9f529]/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(255,255,255,0.52)_25%,transparent_25%),linear-gradient(225deg,rgba(255,255,255,0.42)_25%,transparent_25%)] bg-[size:72px_72px] opacity-35 dark:opacity-[0.08]" />
      </div>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mx-auto flex w-full max-w-5xl flex-col items-center"
      >
        <div className="mb-8 text-center md:mb-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springSnappy, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/70 bg-white/65 text-3xl shadow-[0_20px_60px_rgba(15,58,100,0.14)] backdrop-blur dark:border-white/10 dark:bg-[#0a233d]/65 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          >
            <motion.span animate={shouldReduceMotion ? {} : { y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: motionEase }}>✈️</motion.span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff3f78] dark:text-[#ff5a8d]"
          >
            AI Trip Planner
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 text-4xl font-semibold tracking-normal text-[#0f3a64] sm:text-5xl lg:text-6xl dark:text-[#e3fafc]"
          >
            บอกเราว่าคุณอยากเที่ยวแบบไหน
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#0f3a64]/68 md:text-lg dark:text-[#e3fafc]/68"
          >
            กรอกข้อมูลพื้นฐานไม่กี่อย่าง แล้ว AI Trip Planner
            จะช่วยสร้างแผนเที่ยวที่ปรับให้เข้ากับสไตล์ของคุณ
          </motion.p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="smooth-card w-full rounded-[2rem] border border-white/70 bg-white/45 p-4 shadow-[0_30px_100px_rgba(15,58,100,0.16)] backdrop-blur-2xl sm:p-6 md:rounded-[2.5rem] md:p-8 dark:border-white/10 dark:bg-[#0a233d]/45 dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
        >
          <div className="rounded-[1.5rem] border border-white/75 bg-white/42 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:p-6 md:rounded-[2rem] md:p-8 dark:border-white/10 dark:bg-[#0f2e4f]/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="grid gap-8">
              <DestinationInput
                value={formData.destination}
                onChange={(value) => updateFormData("destination", value)}
              />

              <div className="space-y-3">
                <label
                  htmlFor="duration"
                  className="block text-base font-semibold tracking-normal text-[#0f3a64] md:text-lg dark:text-[#e3fafc]"
                >
                  คุณวางแผนเดินทางกี่วัน?
                </label>
                <div className="relative max-w-xs">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                    🗓️
                  </span>
                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(event) =>
                      updateFormData("duration", event.target.value)
                    }
                    placeholder="เช่น 3"
                    min={1}
                    max={30}
                    className="h-14 w-full rounded-2xl border border-white/70 bg-white/80 pl-12 pr-4 text-base text-[#0f3a64] shadow-[0_18px_60px_rgba(15,58,100,0.08)] outline-none backdrop-blur transition placeholder:text-[#0f3a64]/40 focus:border-[#ff3f78]/70 focus:bg-white focus:ring-4 focus:ring-[#ff3f78]/15 dark:border-white/10 dark:bg-[#0a233d]/80 dark:text-[#e3fafc] dark:placeholder:text-[#e3fafc]/40 dark:shadow-[0_18px_60px_rgba(0,0,0,0.2)] dark:focus:bg-[#0a233d] dark:focus:border-[#ff3f78]/70 dark:focus:ring-[#ff3f78]/22"
                  />
                </div>
              </div>

              <BudgetSelector
                value={formData.budget}
                onChange={(value: BudgetValue) =>
                  updateFormData("budget", value)
                }
              />

              <TravelersSelector
                value={formData.travelers}
                onChange={(value: TravelersValue) =>
                  updateFormData("travelers", value)
                }
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm font-medium text-[#0f3a64]/58 dark:text-[#e3fafc]/58">
            🆓 ผู้ใช้ฟรีสร้างทริปได้ 3 ทริปต่อวัน ระบบจะแจ้งเตือนเมื่อถึงโควตา
          </p>

          <motion.button
            type="submit"
            disabled={!isFormValid || loading}
            whileHover={!shouldReduceMotion && !loading && isFormValid ? { scale: 1.01, y: -2 } : {}}
            whileTap={!loading && isFormValid ? pressTap : {}}
            transition={springSnappy}
            className={`mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#ff3f78] px-6 text-base font-semibold text-white shadow-[0_14px_36px_rgba(255,63,120,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ff6b95] disabled:pointer-events-none disabled:translate-y-0 disabled:bg-[#0f3a64]/22 disabled:shadow-none dark:shadow-[0_14px_36px_rgba(255,63,120,0.25)] dark:disabled:bg-[#e3fafc]/10 dark:disabled:text-[#e3fafc]/30 ${isFormValid && !loading ? "cta-glow" : ""}`}
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingMsgIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: motionEase }}
                  >
                    {loadingMessages[loadingMsgIndex]}
                  </motion.span>
                </AnimatePresence>
              </>
            ) : (
              "สร้างทริปของฉัน ✨"
            )}
          </motion.button>

          <AnimatePresence>
            {saveStep !== "idle" ? (
              <motion.div
                initial={{ opacity: 0, y: 12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.36, ease: motionEase }}
                className="mt-4 space-y-2 overflow-hidden rounded-2xl border border-white/70 bg-white/60 px-4 py-4 shadow-[0_18px_50px_rgba(15,58,100,0.08)] backdrop-blur dark:border-white/10 dark:bg-[#0f2e4f]/60 dark:shadow-[0_18px_50px_rgba(0,0,0,0.2)]"
              >
                <StepItem
                  done={["saving", "redirecting"].includes(saveStep)}
                  active={saveStep === "generating"}
                  label="🤖 AI กำลังสร้างแผนการเดินทาง..."
                />
                <StepItem
                  done={saveStep === "redirecting"}
                  active={saveStep === "saving"}
                  label="💾 กำลังบันทึกทริปของคุณ..."
                />
                <StepItem
                  done={false}
                  active={saveStep === "redirecting"}
                  label="✈️ กำลังพาคุณไปหน้าทริป..."
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </form>
      </motion.section>

      {error ? (
        <ErrorToast message={error} onClose={() => setError(null)} />
      ) : null}

      {rateLimitError ? (
        <RateLimitBanner
          message={rateLimitError.message}
          limit={rateLimitError.limit}
          resetTime={rateLimitError.resetTime}
          onDismiss={() => setRateLimitError(null)}
        />
      ) : null}
    </main>
  );
}

function StepItem({
  done,
  active,
  label,
}: {
  done: boolean;
  active: boolean;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: motionEase }}
      className={`flex items-center gap-2 text-sm font-medium transition-all ${
        done ? "text-green-500 dark:text-green-400" : active ? "text-[#ff3f78] dark:text-[#ff5a8d]" : "text-gray-400 dark:text-gray-500"
      }`}
    >
      {done ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>✅</motion.span>
      ) : active ? (
        <span className="inline-block h-4 w-4 rounded-full border-2 border-[#ff3f78] dark:border-[#ff5a8d] border-t-transparent animate-spin" />
      ) : (
        "⭕"
      )}
      <span>{label}</span>
    </motion.div>
  );
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#9de9f4] px-4 text-[#0f3a64] dark:bg-[#081d33] dark:text-[#e3fafc]">
      <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-4 text-sm font-semibold shadow-[0_24px_80px_rgba(15,58,100,0.14)] backdrop-blur dark:border-white/10 dark:bg-[#0a233d]/70 dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#ff3f78]/25 border-t-[#ff3f78] dark:border-[#ff5a8d]/25 dark:border-t-[#ff5a8d]" />
        {label}
      </div>
    </main>
  );
}


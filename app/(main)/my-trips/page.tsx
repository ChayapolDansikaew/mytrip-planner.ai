"use client";

import Link from "next/link";
import { Plane, MapPinned, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";

import SiteHeader from "@/components/SiteHeader";
import TripCard from "@/components/my-trips/TripCard";
import TripCardSkeleton from "@/components/my-trips/TripCardSkeleton";
import { api } from "@/convex/_generated/api";
import { fadeUp, liftHover, pressTap, springSnappy, staggerFast } from "@/lib/motion";

const container: Variants = staggerFast;

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springSnappy },
};

export default function MyTripsPage() {
  const { isLoaded, user } = useUser();
  const shouldReduceMotion = useReducedMotion();
  const trips = useQuery(
    api.trips.getUserTrips,
    user?.id ? { userId: user.id } : "skip",
  );

  const isLoading = !isLoaded || Boolean(user?.id && trips === undefined);
  const isSignedOut = isLoaded && !user;

  return (
    <>
      <SiteHeader />

      <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-tr from-sky-300 via-[#9de9f4] to-emerald-200 px-4 py-10 text-[#0f3a64] selection:bg-[#ff3f78]/20 selection:text-[#0f3a64] sm:px-6 lg:px-8 dark:from-[#051121] dark:via-[#081d33] dark:to-[#041a15] dark:text-[#e3fafc] dark:selection:bg-[#ff3f78]/20 dark:selection:text-[#e3fafc]">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.88),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(185,245,41,0.32),transparent_24%),linear-gradient(180deg,#c9f7ff_0%,rgba(247,252,255,0.6)_48%,rgba(255,248,237,0.4)_100%)] dark:bg-[radial-gradient(circle_at_16%_12%,rgba(5,17,33,0.92),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(185,245,41,0.1),transparent_24%),linear-gradient(180deg,#051121_0%,rgba(8,29,51,0.6)_50%,rgba(4,26,21,0.4)_100%)]" />
          <div className="absolute left-[-8rem] top-28 h-72 w-72 rounded-full bg-[#ff3f78]/16 dark:bg-[#ff3f78]/8 blur-3xl" />
          <div className="absolute bottom-8 right-[-7rem] h-80 w-80 rounded-full bg-[#b9f529]/35 dark:bg-[#b9f529]/15 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(255,255,255,0.52)_25%,transparent_25%),linear-gradient(225deg,rgba(255,255,255,0.42)_25%,transparent_25%)] bg-[size:72px_72px] opacity-35 dark:opacity-[0.08]" />
        </div>

        <div className="mx-auto w-full max-w-6xl">
          {/* Page header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/45 p-5 shadow-[0_30px_100px_rgba(15,58,100,0.14)] backdrop-blur-2xl sm:p-6 md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-[#0a233d]/45 dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] transition-colors duration-300"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff3f78] dark:text-[#ff5a8d]">
                My Trips
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#0f3a64] sm:text-4xl dark:text-[#e3fafc]">
                🗺️ ทริปของฉัน
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#0f3a64]/68 sm:text-base dark:text-[#e3fafc]/68">
                แผนการเดินทางที่สร้างโดย AI ทั้งหมดของคุณ
              </p>
            </div>
            <Link
              href="/create-trip"
              className="soft-focus-ring hidden h-12 items-center justify-center rounded-full bg-[#ff3f78] px-6 text-sm font-semibold text-white shadow-[0_14px_38px_rgba(255,63,120,0.34)] transition hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95 hover:bg-[#ff6b95] sm:inline-flex dark:shadow-[0_14px_38px_rgba(255,63,120,0.25)]"
            >
              + สร้างทริปใหม่
            </Link>
          </motion.div>

          {/* Loading state — skeleton grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <TripCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {/* Signed out state */}
          {isSignedOut ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/52 px-6 py-24 text-center shadow-[0_30px_100px_rgba(15,58,100,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a233d]/52 dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] transition-colors duration-300"
            >
              <span className="text-6xl">🔐</span>
              <h2 className="mt-5 text-2xl font-semibold tracking-normal text-[#0f3a64] dark:text-[#e3fafc]">
                ล็อกอินเพื่อดูทริปของคุณ
              </h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-[#0f3a64]/62 dark:text-[#e3fafc]/62">
                เข้าสู่ระบบเพื่อดูแผนการเดินทางที่เคยสร้างไว้และเริ่มวางแผนทริปใหม่
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#ff3f78] px-6 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(255,63,120,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95] dark:shadow-[0_18px_55px_rgba(255,63,120,0.2)]"
              >
                กลับไปหน้าแรก
              </Link>
            </motion.div>
          ) : null}

          {/* Empty state */}
          {trips?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/52 px-6 py-32 text-center shadow-[0_30px_100px_rgba(15,58,100,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a233d]/52 dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] transition-colors duration-300"
            >
              <div className="relative flex h-48 w-48 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#ff3f78]/10 dark:bg-[#ff3f78]/5 blur-2xl" />
                
                {/* Main Plane Icon */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff3f78] to-[#ff6b95] shadow-[0_16px_40px_rgba(255,63,120,0.3)]"
                >
                  <Plane className="h-10 w-10 text-white" />
                </motion.div>
 
                {/* Floating Map Pin */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, 8, 0], rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-4 left-4 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-[0_12px_30px_rgba(15,58,100,0.15)] backdrop-blur-md dark:border-white/10 dark:bg-[#0f2e4f]/80 dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
                >
                  <MapPinned className="h-6 w-6 text-[#22d3ee]" />
                </motion.div>
 
                {/* Floating Sparkles */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
                  className="absolute right-6 top-4 z-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#b9f529] shadow-[0_10px_24px_rgba(185,245,41,0.4)] dark:bg-[#b9f529]/80 dark:shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
                >
                  <Sparkles className="h-5 w-5 text-[#0f3a64] dark:text-[#e3fafc]" />
                </motion.div>
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-normal text-[#0f3a64] dark:text-[#e3fafc]">
                การผจญภัยของคุณเริ่มต้นที่นี่!
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-7 text-[#0f3a64]/70 dark:text-[#e3fafc]/70">
                บอก AI ว่าอยากไปไหน แล้วแผนเดินทางจะพร้อมในไม่กี่วินาที
              </p>
              <Link
                href="/create-trip"
                className="soft-focus-ring mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#ff3f78] px-8 text-base font-semibold text-white shadow-[0_14px_38px_rgba(255,63,120,0.34)] transition hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95 hover:bg-[#ff6b95] dark:shadow-[0_14px_38px_rgba(255,63,120,0.25)]"
              >
                ✨ สร้างทริปแรก
              </Link>
            </motion.div>
          ) : null}

          {/* Trip cards grid with stagger animation */}
          {trips && trips.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {trips.map((trip) => (
                  <motion.div
                    key={trip._id}
                    variants={item}
                    layout
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                    whileHover={shouldReduceMotion ? {} : liftHover}
                    whileTap={pressTap}
                    transition={springSnappy}
                  >
                    <TripCard trip={trip} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </div>

        {/* Floating mobile CTA */}
        {!isLoading && !isSignedOut && trips && trips.length > 0 ? (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 sm:hidden">
            <Link
              href="/create-trip"
              className="soft-focus-ring inline-flex h-14 items-center justify-center rounded-full bg-[#ff3f78] px-8 text-sm font-semibold text-white shadow-[0_14px_38px_rgba(255,63,120,0.34)] transition hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-95 hover:bg-[#ff6b95] dark:shadow-[0_14px_38px_rgba(255,63,120,0.25)]"
            >
              + สร้างทริปใหม่
            </Link>
          </div>
        ) : null}
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import SiteHeader from "@/components/SiteHeader";
import TripCard from "@/components/my-trips/TripCard";
import TripCardSkeleton from "@/components/my-trips/TripCardSkeleton";
import { api } from "@/convex/_generated/api";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export default function MyTripsPage() {
  const { isLoaded, user } = useUser();
  const trips = useQuery(
    api.trips.getUserTrips,
    user?.id ? { userId: user.id } : "skip",
  );

  const isLoading = !isLoaded || Boolean(user?.id && trips === undefined);
  const isSignedOut = isLoaded && !user;

  return (
    <>
      <SiteHeader />

      <main className="relative isolate min-h-screen overflow-hidden bg-[#9de9f4] px-4 py-10 text-[#0f3a64] selection:bg-[#ff3f78]/20 selection:text-[#0f3a64] sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.88),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(185,245,41,0.32),transparent_24%),linear-gradient(180deg,#c9f7ff_0%,#f7fcff_48%,#fff8ed_100%)]" />
          <div className="absolute left-[-8rem] top-28 h-72 w-72 rounded-full bg-[#ff3f78]/16 blur-3xl" />
          <div className="absolute bottom-8 right-[-7rem] h-80 w-80 rounded-full bg-[#b9f529]/35 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(255,255,255,0.52)_25%,transparent_25%),linear-gradient(225deg,rgba(255,255,255,0.42)_25%,transparent_25%)] bg-[size:72px_72px] opacity-35" />
        </div>

        <div className="mx-auto w-full max-w-6xl">
          {/* Page header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/45 p-5 shadow-[0_30px_100px_rgba(15,58,100,0.14)] backdrop-blur-2xl sm:p-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff3f78]">
                My Trips
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#0f3a64] sm:text-4xl">
                🗺️ ทริปของฉัน
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#0f3a64]/68 sm:text-base">
                แผนการเดินทางที่สร้างโดย AI ทั้งหมดของคุณ
              </p>
            </div>
            <Link
              href="/create-trip"
              className="hidden h-12 items-center justify-center rounded-full bg-[#ff3f78] px-6 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(255,63,120,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95] sm:inline-flex"
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
              className="flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/52 px-6 py-24 text-center shadow-[0_30px_100px_rgba(15,58,100,0.12)] backdrop-blur-2xl"
            >
              <span className="text-6xl">🔐</span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#0f3a64]">
                กรุณาเข้าสู่ระบบก่อนดูทริปของคุณ
              </h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-[#0f3a64]/62">
                เข้าสู่ระบบเพื่อดูแผนการเดินทางที่เคยสร้างไว้และเริ่มวางแผนทริปใหม่
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#ff3f78] px-6 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(255,63,120,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95]"
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
              className="flex flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/52 px-6 py-32 text-center shadow-[0_30px_100px_rgba(15,58,100,0.12)] backdrop-blur-2xl"
            >
              <div className="text-7xl animate-bounce">✈️</div>
              <h2 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-gray-700">
                ยังไม่มีทริปของคุณ
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-7 text-gray-500">
                เริ่มสร้างทริปแรกของคุณด้วย AI
                แล้วแผนการเดินทางในฝันจะเป็นจริง!
              </p>
              <Link
                href="/create-trip"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-pink-500 px-8 text-base font-semibold text-white shadow-[0_18px_55px_rgba(236,72,153,0.3)] transition hover:-translate-y-0.5 hover:bg-pink-600"
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
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {trips.map((trip) => (
                  <motion.div
                    key={trip._id}
                    variants={item}
                    layout
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
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
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff3f78] px-6 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(255,63,120,0.4)] transition hover:bg-[#ff6b95]"
            >
              + สร้างทริปใหม่
            </Link>
          </div>
        ) : null}
      </main>
    </>
  );
}

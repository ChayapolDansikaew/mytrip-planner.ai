"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import { Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { pressTap, springSnappy } from "@/lib/motion";

const navItems = [
  { label: "หน้าแรก", href: "/#top" },
  { label: "ทริปยอดนิยม", href: "/#destinations" },
  { label: "วิธีทำงาน", href: "/#how-it-works" },
  { label: "ทริปของฉัน", href: "/my-trips" },
  { label: "🌍 แผนที่โลก", href: "/global-map" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/60 bg-[#9de9f4]/72 shadow-[0_12px_40px_rgba(15,58,100,0.08)] backdrop-blur-2xl"
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          className="flex items-center gap-3"
          href="/#top"
          aria-label="กลับสู่หน้าแรก AI Trip Planner"
        >
          <motion.span
            whileHover={shouldReduceMotion ? {} : { rotate: 18, scale: 1.06 }}
            whileTap={pressTap}
            transition={springSnappy}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          >
            <Compass className="h-4 w-4 text-[#ff3f78]" />
          </motion.span>
          <span className="text-lg font-semibold tracking-[-0.03em] text-[#0f3a64]">
            AI Trip Planner
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/42 p-1 text-sm text-[#0f3a64]/68 shadow-sm backdrop-blur md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 transition hover:bg-white/60 hover:text-[#0f3a64] ${
                  isActive ? "text-[#ff3f78] shadow-sm" : ""
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-white/70"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "outline", size: "sm", className: "soft-focus-ring" })}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "sm", className: "soft-focus-ring" })}
              >
                เริ่มวางแผน
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

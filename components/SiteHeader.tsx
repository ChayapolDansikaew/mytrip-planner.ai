"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Compass, Menu, X, Sun, Moon } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [glowKey, setGlowKey] = useState(0);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const timer = setTimeout(() => {
      setTheme(isDark ? "dark" : "light");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    setGlowKey((k) => k + 1);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/60 dark:border-white/10 bg-[#bdf3fa] dark:bg-[#07192b] shadow-[0_12px_40px_rgba(15,58,100,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-colors duration-300"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/55 dark:bg-[#0a233d]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          >
            <Compass className="h-4 w-4 text-[#ff3f78]" />
          </motion.span>
          <span className="text-lg font-semibold tracking-normal text-[#0f3a64] dark:text-[#e3fafc]">
            AI Trip Planner
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 rounded-full border border-white/70 dark:border-white/10 bg-white/85 dark:bg-[#0a233d]/90 p-1 text-sm text-[#0f3a64]/85 dark:text-[#e3fafc]/85 shadow-sm md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-4 py-2 transition hover:bg-white/60 dark:hover:bg-[#0f2e4f]/80 hover:text-[#0f3a64] dark:hover:text-[#e3fafc] ${
                  isActive ? "text-[#ff3f78] dark:text-[#ff5a8d] shadow-sm font-semibold" : ""
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-white/70 dark:bg-white/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/80 dark:border-white/10 dark:bg-[#0a233d] text-[#0f3a64] dark:text-[#e3fafc] shadow-sm hover:bg-white dark:hover:bg-[#143c66] focus:outline-none cursor-pointer transition overflow-hidden"
            aria-label={theme === "light" ? "สลับเป็นโหมดมืด" : "สลับเป็นโหมดสว่าง"}
            type="button"
          >
            {/* Glow pulse on toggle */}
            <AnimatePresence>
              {glowKey > 0 && (
                <motion.span
                  key={glowKey}
                  initial={{ opacity: 0.7, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full ${
                    theme === "dark"
                      ? "bg-blue-400/40"
                      : "bg-amber-300/50"
                  }`}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -10, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 10, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "outline", size: "sm", className: "soft-focus-ring dark:bg-[#0a233d] dark:text-white dark:hover:bg-[#0f2e4f]" })}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ size: "sm", className: "soft-focus-ring" })}
              >
                เริ่มวางแผน
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 dark:border-white/10 bg-white/80 dark:bg-[#0a233d] text-[#0f3a64] dark:text-[#e3fafc] shadow-sm hover:bg-white dark:hover:bg-[#143c66] focus:outline-none md:hidden"
            aria-label={isMobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-white/60 dark:border-white/10 bg-[#bdf3fa] dark:bg-[#07192b] shadow-inner md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#ff3f78] text-white shadow-sm"
                        : "bg-white/60 dark:bg-[#0a233d]/70 text-[#0f3a64]/85 dark:text-[#e3fafc]/85 hover:bg-white/90 dark:hover:bg-[#0f2e4f]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {!isSignedIn && (
                <div className="mt-2 flex flex-col gap-2 border-t border-white/40 dark:border-white/10 pt-4 sm:hidden">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-center soft-focus-ring dark:bg-[#0a233d] dark:text-white" })}
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={buttonVariants({ size: "sm", className: "w-full justify-center soft-focus-ring" })}
                  >
                    เริ่มวางแผน
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


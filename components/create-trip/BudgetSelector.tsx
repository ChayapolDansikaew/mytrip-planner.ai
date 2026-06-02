"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { pressTap } from "@/lib/motion";

type BudgetValue = "cheap" | "moderate" | "luxury";

type BudgetSelectorProps = {
  value: string;
  onChange: (value: BudgetValue) => void;
};

const budgetOptions: Array<{
  value: BudgetValue;
  emoji: string;
  title: string;
  description: string;
}> = [
  {
    value: "cheap",
    emoji: "💰",
    title: "ประหยัด",
    description: "ควบคุมค่าใช้จ่ายให้คุ้มค่า",
  },
  {
    value: "moderate",
    emoji: "💳",
    title: "ปานกลาง",
    description: "ใช้งบแบบสมดุล ไม่มากหรือน้อยเกินไป",
  },
  {
    value: "luxury",
    emoji: "💎",
    title: "หรูหรา",
    description: "เน้นประสบการณ์พรีเมียม ไม่ต้องกังวลเรื่องงบ",
  },
];

export function BudgetSelector({ value, onChange }: BudgetSelectorProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="text-base font-semibold tracking-[-0.02em] text-[#0f3a64] md:text-lg dark:text-[#e3fafc]">
          งบประมาณของคุณเป็นแบบไหน?
        </legend>
        <p className="mt-1 text-sm leading-6 text-[#0f3a64]/60 dark:text-[#e3fafc]/60">
          งบประมาณนี้ใช้สำหรับกิจกรรมและมื้ออาหารเป็นหลัก
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {budgetOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              whileHover={shouldReduceMotion ? {} : { scale: 1.015, y: -2 }}
              whileTap={pressTap}
              className={cn(
                "group rounded-[1.35rem] border bg-white/78 p-5 text-left shadow-[0_18px_50px_rgba(15,58,100,0.08)] backdrop-blur transition-all duration-300 hover:border-[#ff3f78]/55 hover:bg-white hover:shadow-[0_24px_70px_rgba(255,63,120,0.16)] dark:bg-[#0a233d]/78 dark:border-white/10 dark:text-[#e3fafc] dark:shadow-[0_18px_50px_rgba(0,0,0,0.2)] dark:hover:bg-[#0f2e4f]/80 dark:hover:border-white/20 dark:hover:shadow-[0_24px_70px_rgba(255,63,120,0.2)]",
                isSelected
                  ? "border-[#ff3f78] bg-[#fff0f5] ring-4 ring-[#ff3f78]/15 dark:border-[#ff3f78] dark:bg-[#ff3f78]/15 dark:ring-[#ff3f78]/25"
                  : "border-white/70",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b9f529]/35 text-2xl transition group-hover:scale-105 dark:bg-[#b9f529]/15">
                {option.emoji}
              </span>
              <span className="mt-4 block text-lg font-semibold tracking-[-0.02em] text-[#0f3a64] dark:text-[#e3fafc]">
                {option.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#0f3a64]/58 dark:text-[#e3fafc]/58">
                {option.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}

export type { BudgetValue };

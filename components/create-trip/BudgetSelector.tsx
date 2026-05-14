"use client";

import { cn } from "@/lib/utils";

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
  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="text-base font-semibold tracking-[-0.02em] text-[#0f3a64] md:text-lg">
          งบประมาณของคุณเป็นแบบไหน?
        </legend>
        <p className="mt-1 text-sm leading-6 text-[#0f3a64]/60">
          งบประมาณนี้ใช้สำหรับกิจกรรมและมื้ออาหารเป็นหลัก
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {budgetOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "group rounded-[1.35rem] border bg-white/78 p-5 text-left shadow-[0_18px_50px_rgba(15,58,100,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#ff3f78]/55 hover:bg-white hover:shadow-[0_24px_70px_rgba(255,63,120,0.16)]",
                isSelected
                  ? "border-[#ff3f78] bg-[#fff0f5] ring-4 ring-[#ff3f78]/15"
                  : "border-white/70",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b9f529]/35 text-2xl transition group-hover:scale-105">
                {option.emoji}
              </span>
              <span className="mt-4 block text-lg font-semibold tracking-[-0.02em] text-[#0f3a64]">
                {option.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#0f3a64]/58">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export type { BudgetValue };

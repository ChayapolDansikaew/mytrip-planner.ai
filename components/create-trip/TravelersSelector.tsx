"use client";

import { cn } from "@/lib/utils";

type TravelersValue = "solo" | "couple" | "family" | "friends";

type TravelersSelectorProps = {
  value: string;
  onChange: (value: TravelersValue) => void;
};

const travelerOptions: Array<{
  value: TravelersValue;
  emoji: string;
  title: string;
  description: string;
}> = [
  {
    value: "solo",
    emoji: "🧍",
    title: "เดินทางคนเดียว",
    description: "ออกสำรวจโลกในสไตล์ของตัวเอง",
  },
  {
    value: "couple",
    emoji: "👫",
    title: "ไปเป็นคู่",
    description: "ทริปสำหรับสองคนที่เดินทางไปด้วยกัน",
  },
  {
    value: "family",
    emoji: "👨‍👩‍👧",
    title: "ครอบครัว",
    description: "กลุ่มนักเดินทางที่ชอบความสนุกและอบอุ่น",
  },
  {
    value: "friends",
    emoji: "👯",
    title: "เพื่อน",
    description: "แก๊งนักผจญภัยที่พร้อมสร้างความทรงจำ",
  },
];

export function TravelersSelector({ value, onChange }: TravelersSelectorProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold tracking-[-0.02em] text-[#0f3a64] md:text-lg dark:text-[#e3fafc]">
        คุณวางแผนจะเดินทางกับใคร?
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {travelerOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "group flex items-start gap-4 rounded-[1.35rem] border bg-white/78 p-5 text-left shadow-[0_18px_50px_rgba(15,58,100,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#ff3f78]/55 hover:bg-white hover:shadow-[0_24px_70px_rgba(255,63,120,0.16)] dark:bg-[#0a233d]/78 dark:border-white/10 dark:text-[#e3fafc] dark:shadow-[0_18px_50px_rgba(0,0,0,0.2)] dark:hover:bg-[#0f2e4f]/80 dark:hover:border-white/20 dark:hover:shadow-[0_24px_70px_rgba(255,63,120,0.2)]",
                isSelected
                  ? "border-[#ff3f78] bg-[#fff0f5] ring-4 ring-[#ff3f78]/15 dark:border-[#ff3f78] dark:bg-[#ff3f78]/15 dark:ring-[#ff3f78]/25"
                  : "border-white/70",
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#9de9f4]/55 text-2xl transition group-hover:scale-105 dark:bg-[#9de9f4]/15">
                {option.emoji}
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-[-0.02em] text-[#0f3a64] dark:text-[#e3fafc]">
                  {option.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[#0f3a64]/58 dark:text-[#e3fafc]/58">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export type { TravelersValue };

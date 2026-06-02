"use client";

type DestinationInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DestinationInput({ value, onChange }: DestinationInputProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="destination"
        className="block text-base font-semibold tracking-[-0.02em] text-[#0f3a64] md:text-lg dark:text-[#e3fafc]"
      >
        คุณอยากเดินทางไปที่ไหน?
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
          📍
        </span>
        <input
          id="destination"
          name="destination"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="เช่น ปารีส, ฝรั่งเศส"
          className="h-14 w-full rounded-2xl border border-white/70 bg-white/80 pl-12 pr-4 text-base text-[#0f3a64] shadow-[0_18px_60px_rgba(15,58,100,0.08)] outline-none backdrop-blur transition placeholder:text-[#0f3a64]/40 focus:border-[#ff3f78]/70 focus:bg-white focus:ring-4 focus:ring-[#ff3f78]/15 dark:border-white/10 dark:bg-[#0a233d]/80 dark:text-[#e3fafc] dark:placeholder:text-[#e3fafc]/40 dark:shadow-[0_18px_60px_rgba(0,0,0,0.2)] dark:focus:bg-[#0a233d] dark:focus:border-[#ff3f78]/70 dark:focus:ring-[#ff3f78]/22"
          autoComplete="off"
        />
      </div>
    </div>
  );
}

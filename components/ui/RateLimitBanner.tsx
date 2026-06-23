"use client";

interface RateLimitBannerProps {
  message: string;
  limit: number;
  resetTime: string;
  onDismiss: () => void;
}

export default function RateLimitBanner({
  message,
  limit,
  resetTime,
  onDismiss,
}: RateLimitBannerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f3a64]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-5 rounded-[2rem] border border-white/80 bg-white p-6 text-center text-[#0f3a64] shadow-[0_30px_120px_rgba(15,58,100,0.28)] sm:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ff3f78] to-[#ff9a4a] text-5xl shadow-[0_22px_70px_rgba(255,63,120,0.28)]">
          ⚡
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-normal text-[#0f3a64]">
            หมดโควตาฟรีแล้ว!
          </h2>
          <p className="text-sm leading-7 text-[#0f3a64]/68">{message}</p>
        </div>

        <div className="space-y-2 rounded-3xl border border-[#9de9f4]/45 bg-[#f4fdff] p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#0f3a64]/58">โควตาฟรีรายวัน</span>
            <span className="font-semibold text-[#0f3a64]">{limit} ทริป/วัน</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#0f3a64]/58">รีเซ็ตโควตาเวลา</span>
            <span className="font-semibold text-[#0f3a64]">{resetTime}</span>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl bg-gradient-to-r from-[#ff3f78]/10 to-[#ff9a4a]/12 p-4 text-left">
          <p className="text-sm font-semibold text-[#0f3a64]">💎 Premium ได้รับ:</p>
          <ul className="space-y-1 text-sm leading-6 text-[#0f3a64]/68">
            <li>✅ สร้างทริปได้ไม่จำกัด</li>
            <li>✅ AI สร้างแผนได้รวดเร็วกว่า</li>
            <li>✅ บันทึกทริปได้ไม่จำกัด</li>
            <li>✅ ไม่มีโฆษณา</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full rounded-full bg-gradient-to-r from-[#ff3f78] to-[#ff9a4a] px-5 py-3 text-base font-semibold text-white shadow-[0_18px_60px_rgba(255,63,120,0.25)] transition hover:-translate-y-0.5 hover:opacity-95"
          >
            ตกลง (รีเซ็ตเวลา {resetTime})
          </button>
        </div>
      </div>
    </div>
  );
}

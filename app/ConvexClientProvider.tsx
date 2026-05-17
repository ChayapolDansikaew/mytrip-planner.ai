"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (!convex) {
    if (isAuthRoute) {
      return <>{children}</>;
    }

    return (
      <main className="grid min-h-screen place-items-center bg-[#9de9f4] px-4 text-center text-[#0f3a64]">
        <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/55 p-6 shadow-[0_30px_100px_rgba(15,58,100,0.16)] backdrop-blur-2xl">
          <h1 className="text-2xl font-semibold tracking-[-0.04em]">
            ตั้งค่า Convex ยังไม่ครบ
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#0f3a64]/70">
            กรุณาเพิ่มค่า NEXT_PUBLIC_CONVEX_URL ใน Environment Variables แล้ว deploy ใหม่อีกครั้ง
          </p>
        </div>
      </main>
    );
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <StoreUserEffect />
      {children}
    </ConvexProviderWithClerk>
  );
}

function StoreUserEffect() {
  useStoreUserEffect();

  return null;
}

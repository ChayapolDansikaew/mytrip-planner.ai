import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Kanit } from "next/font/google";
import Script from "next/script";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Trip Planner | วางแผนทริปด้วย AI",
  description: "วางแผนทริปสดใสด้วย AI พร้อมแผนเที่ยวที่ละเอียด อ่านง่าย และปรับแต่งได้",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/create-trip"
      signUpFallbackRedirectUrl="/create-trip"
    >
      <html
        lang="th"
        className={`${kanit.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <Script
            id="theme-init"
            src="/scripts/theme-init.js"
            strategy="beforeInteractive"
          />
        </head>
        <body className={`${kanit.className} min-h-full flex flex-col`}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


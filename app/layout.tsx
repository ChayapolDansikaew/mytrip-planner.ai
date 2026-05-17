import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Kanit } from "next/font/google";
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
      >
        <body className={`${kanit.className} min-h-full flex flex-col`}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

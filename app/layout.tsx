import type { Metadata } from "next";
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
        <body className={`${kanit.className} min-h-full flex flex-col`}>
          <Script
            id="theme-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              `,
            }}
          />
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Convex and external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  // Redirect legacy /view/trip/:id → /view-trip/:id
  async redirects() {
    return [
      {
        source: "/view/trip/:tripId",
        destination: "/view-trip/:tripId",
        permanent: true,
      },
    ];
  },
  // Remove webpack config entirely — not compatible with Turbopack
  // Mapbox GL works fine without the alias in Next.js 16+
};

export default nextConfig;

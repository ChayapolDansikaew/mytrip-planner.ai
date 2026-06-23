import arcjet, { shield, tokenBucket } from "@arcjet/next";

export const ajAnonymous = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 1,
      interval: "1d",
      capacity: 1,
    }),
    shield({
      mode: "LIVE",
    }),
  ],
});

export const ajFree = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 3,
      interval: "1d",
      capacity: 3,
    }),
    shield({
      mode: "LIVE",
    }),

  ],
});

export default ajFree;

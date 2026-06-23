"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const hasMounted = useRef(false);

  // On first render (SSR + initial hydration), skip animation to prevent
  // hydration mismatch. Framer Motion sets inline styles (opacity:0, translateY)
  // that won't exist in the server-rendered HTML.
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  const isFirstRender = !hasMounted.current; // eslint-disable-line react-hooks/refs
  hasMounted.current = true; // eslint-disable-line react-hooks/refs

  return (
    <motion.div
      initial={isFirstRender ? false : { opacity: 0, y: 6 }} // eslint-disable-line react-hooks/refs
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col flex-grow w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}


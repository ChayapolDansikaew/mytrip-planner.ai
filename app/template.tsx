"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const shouldReduceMotion = isMounted ? prefersReducedMotion : false;

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={isMounted ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col flex-grow w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}


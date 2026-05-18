"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

/**
 * Animates text appearance with a subtle typewriter-like reveal.
 * For numeric values, counts up; for strings, reveals character by character.
 */
export default function AnimatedCounter({
  value,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("");
  const animationRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const hasAnimated = useRef(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasAnimated.current = true;
      queueMicrotask(() => setDisplayValue(value));
      return;
    }

    if (hasAnimated.current) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          // Numeric animation
          const numericMatch = value.match(/^(\d+)/);
          if (numericMatch) {
            const target = parseInt(numericMatch[1], 10);
            const suffix = value.slice(numericMatch[1].length);
            let current = 0;
            const step = Math.max(1, Math.floor(target / 30));
            animationRef.current = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(animationRef.current);
              }
              setDisplayValue(`${current}${suffix}`);
            }, 25);
          } else {
            // Character reveal
            let i = 0;
            animationRef.current = setInterval(() => {
              i++;
              setDisplayValue(value.slice(0, i));
              if (i >= value.length) {
                clearInterval(animationRef.current);
              }
            }, 40);
          }
        }
      },
      { threshold: 0.3 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      clearInterval(animationRef.current);
    };
  }, [value]);

  return (
    <span ref={containerRef} className={className}>
      {displayValue || "\u00A0"}
    </span>
  );
}

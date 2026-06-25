"use client";

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  format,
  duration = 0.5,
  className,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(() => format(value));

  useMotionValueEvent(motionValue, "change", (v) => {
    setDisplay(format(v));
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: reduce ? 0 : duration,
      ease: [0.32, 0.72, 0, 1],
    });
    return () => controls.stop();
  }, [value, duration, motionValue, reduce]);

  return <span className={className}>{display}</span>;
}

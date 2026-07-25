"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function TiltCard({
  children,
  className = "",
  glow = true,
  maxTilt = 10,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const rotateX = useSpring(useTransform(mvY, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 250,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mvX, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 250,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mvX.set(px - 0.5);
    mvY.set(py - 0.5);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleMouseLeave() {
    mvX.set(0);
    mvY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`relative ${className}`}
    >
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([gx, gy]) =>
                `radial-gradient(220px circle at ${gx}% ${gy}%, rgba(91,141,239,0.18), transparent 70%)`
            ),
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
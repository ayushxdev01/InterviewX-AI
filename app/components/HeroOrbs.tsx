"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function HeroOrbs() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const orb1X = useTransform(springX, [-1, 1], [-20, 20]);
  const orb1Y = useTransform(springY, [-1, 1], [-15, 15]);
  const orb2X = useTransform(springX, [-1, 1], [25, -25]);
  const orb2Y = useTransform(springY, [-1, 1], [15, -15]);
  const orb3X = useTransform(springX, [-1, 1], [-15, 15]);
  const orb3Y = useTransform(springY, [-1, 1], [20, -20]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[8%] left-[8%] w-96 h-96 rounded-full blur-2xl opacity-60"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(91,141,239,0.9)_0%,transparent_70%)]" />
      </motion.div>

      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[30%] right-[4%] w-[28rem] h-[28rem] rounded-full blur-2xl opacity-50"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(255,122,89,0.9)_0%,transparent_70%)]" />
      </motion.div>

      <motion.div
        style={{ x: orb3X, y: orb3Y }}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[5%] left-[28%] w-80 h-80 rounded-full blur-2xl opacity-50"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(61,220,151,0.9)_0%,transparent_70%)]" />
      </motion.div>
    </div>
  );
}
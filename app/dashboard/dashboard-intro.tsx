"use client";

import { motion } from "framer-motion";

export default function DashboardIntro({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-display text-3xl font-semibold mb-2">
        Welcome, {name}
      </h1>
      <p className="text-muted mb-10">
        Upload your resume to get personalized, resume-aware interview questions.
      </p>
    </motion.div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, Target, Sparkles } from "lucide-react";

type InterviewRecord = {
  created_at: string;
  round_type: string;
  feedback: {
    overall_score: number;
    technical_score: number;
    communication_score: number;
  } | null;
};

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className="font-display text-3xl font-semibold">
      {display}
      {suffix}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  delay = 0,
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border border-border bg-panel p-5"
    >
      <div className="flex items-center gap-2 text-muted mb-3">
        <Icon size={16} className="text-signal" />
        <span className="text-xs">{label}</span>
      </div>
      <CountUp value={value} suffix={suffix} />
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-panel2 px-3 py-2 text-xs shadow-xl">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardAnalytics({
  interviews,
}: {
  interviews: InterviewRecord[];
}) {
  const scored = interviews.filter((iv) => iv.feedback);

  if (scored.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-dashed border-border p-8 text-center mb-10"
      >
        <Sparkles className="text-signal mx-auto mb-2" size={22} />
        <p className="text-muted text-sm">
          Complete your first mock interview to see your progress here.
        </p>
      </motion.div>
    );
  }

  const avgOverall = Math.round(
    scored.reduce((sum, iv) => sum + (iv.feedback?.overall_score || 0), 0) / scored.length
  );
  const bestScore = Math.max(...scored.map((iv) => iv.feedback?.overall_score || 0));

  const chartData = scored.map((iv, i) => ({
    date: new Date(iv.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    session: `#${i + 1}`,
    Overall: iv.feedback?.overall_score,
    Technical: iv.feedback?.technical_score,
    Communication: iv.feedback?.communication_score,
  }));

  return (
    <div className="mb-12">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Target} label="Interviews completed" value={scored.length} delay={0} />
        <StatCard icon={TrendingUp} label="Average score" value={avgOverall} suffix="/100" delay={0.1} />
        <StatCard icon={Sparkles} label="Best score" value={bestScore} suffix="/100" delay={0.2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-border bg-panel p-5"
      >
        <p className="text-sm font-medium mb-4">Score trend across sessions</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3038" vertical={false} />
            <XAxis dataKey="session" stroke="#8B949E" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#8B949E" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Overall" stroke="#5B8DEF" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Technical" stroke="#3DDC97" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="Communication" stroke="#FF7A59" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
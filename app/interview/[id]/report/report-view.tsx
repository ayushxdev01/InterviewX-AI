"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Info,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import { MagneticButton } from "../../../components/MagneticButton";

type Feedback = {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvement_tips: string[];
  consistency_note?: string;
};

function scoreColor(score: number) {
  if (score >= 70) return "bg-pass";
  if (score >= 40) return "bg-signal";
  return "bg-confidence";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-sm font-mono font-medium">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-panel2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${scoreColor(score)}`}
        />
      </div>
    </div>
  );
}

export default function ReportView({
  interviewId,
  initialFeedback,
}: {
  interviewId: string;
  initialFeedback: Feedback | null;
}) {
  const [feedback, setFeedback] = useState<Feedback | null>(initialFeedback);
  const [loading, setLoading] = useState(!initialFeedback);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (feedback) return;

    async function generate() {
      try {
        const res = await fetch(`/api/interview/${interviewId}/feedback`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Couldn't generate your feedback report.");
          setLoading(false);
          return;
        }
        setFeedback(data.feedback);
      } catch {
        setError("Connection issue while generating your report.");
      } finally {
        setLoading(false);
      }
    }

    generate();
  }, [feedback, interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-signal" size={32} />
        <p className="text-muted">Analyzing your interview…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-confidence/30 bg-confidence/10 p-6 text-center">
        <p className="text-confidence mb-4">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-signal text-sm hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!feedback) return null;

  function downloadReport() {
    if (!feedback) return;
    const doc = new jsPDF();
    const margin = 15;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 20;

    const addLines = (text: string, size = 11) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, width);
      if (y + lines.length * 6 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin, y);
      y += lines.length * 6 + 4;
    };

    doc.setFontSize(16);
    doc.text("Feedback Report — InterviewX AI", margin, y);
    y += 10;

    addLines(feedback.summary);
    addLines(`Overall: ${feedback.overall_score}/100   Technical: ${feedback.technical_score}/100   Communication: ${feedback.communication_score}/100`);

    y += 2;
    addLines("Strengths:", 13);
    feedback.strengths.forEach((s) => addLines(`• ${s}`));

    y += 2;
    addLines("Areas to improve:", 13);
    feedback.weaknesses.forEach((w) => addLines(`• ${w}`));

    y += 2;
    addLines("Improvement tips:", 13);
    feedback.improvement_tips.forEach((t) => addLines(`• ${t}`));

    if (feedback.consistency_note) {
      y += 2;
      addLines("Note:", 13);
      addLines(feedback.consistency_note);
    }

    doc.save("feedback-report.pdf");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-display text-3xl font-semibold mb-2">Your Feedback Report</h1>
      <p className="text-muted mb-8">{feedback.summary}</p>

      <div className="rounded-xl border border-border bg-panel p-6 mb-6">
        <ScoreBar label="Overall" score={feedback.overall_score} />
        <ScoreBar label="Technical" score={feedback.technical_score} />
        <ScoreBar label="Communication" score={feedback.communication_score} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl border border-pass/30 bg-pass/5 p-5">
          <div className="flex items-center gap-2 text-pass mb-3">
            <CheckCircle2 size={18} />
            <span className="font-medium">Strengths</span>
          </div>
          <ul className="space-y-2 text-sm text-ink">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-pass">•</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-confidence/30 bg-confidence/5 p-5">
          <div className="flex items-center gap-2 text-confidence mb-3">
            <AlertTriangle size={18} />
            <span className="font-medium">Areas to improve</span>
          </div>
          <ul className="space-y-2 text-sm text-ink">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-confidence">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-signal/30 bg-signal/5 p-5 mb-8">
        <div className="flex items-center gap-2 text-signal mb-3">
          <Lightbulb size={18} />
          <span className="font-medium">Improvement tips</span>
        </div>
        <ul className="space-y-2 text-sm text-ink">
          {feedback.improvement_tips.map((tip, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-signal">•</span> {tip}
            </li>
          ))}
        </ul>
      </div>

      {feedback.consistency_note && (
        <div className="rounded-xl border border-border bg-panel2 p-5 mb-8">
          <div className="flex items-center gap-2 text-muted mb-2">
            <Info size={16} />
            <span className="font-medium text-sm">A small note</span>
          </div>
          <p className="text-sm text-muted">{feedback.consistency_note}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <MagneticButton
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm hover:border-signal/40"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </MagneticButton>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 rounded-lg bg-signal text-white text-sm px-5 py-2.5 hover:bg-signal/90 transition-colors"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>
    </motion.div>
  );
}
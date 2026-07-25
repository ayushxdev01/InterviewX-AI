"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Play } from "lucide-react";
import { TiltCard } from "../components/TiltCard";
import { MagneticButton } from "../components/MagneticButton";

type ParsedResume = {
  name: string;
  skills: string[];
  projects: { title: string; description: string; tech: string[] }[];
  experience: { role: string; company: string; duration: string }[];
  education: { degree: string; institution: string; year: string }[];
};

type ResumeRow = {
  id: string;
  parsed_data: ParsedResume;
};

export default function ResumeUpload({
  initialResume = null,
}: {
  initialResume?: ResumeRow | null;
}) {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    initialResume ? "done" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [resume, setResume] = useState<ResumeRow | null>(initialResume);
  const [roundType, setRoundType] = useState<"technical" | "hr">("technical");
  const [questionCount, setQuestionCount] = useState<5 | 8 | 12>(5);
  const [starting, setStarting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setStatus("uploading");
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      setResume(data.resume);
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("Upload failed. Check your connection and try again.");
    }
  }

  async function startInterview() {
    if (!resume || starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          roundType,
          questionCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not start interview.");
        setStarting(false);
        return;
      }
      router.push(`/interview/${data.interview.id}`);
    } catch {
      setErrorMsg("Could not start interview. Try again.");
      setStarting(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  const parsed = resume?.parsed_data;

  return (
    <div className="max-w-2xl">
      {status !== "done" && (
        <TiltCard maxTilt={3} className="rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragActive ? "border-signal bg-signal/5" : "border-border hover:border-signal/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleSelect}
            />

            {status === "uploading" ? (
              <div className="flex flex-col items-center gap-3 text-signal">
                <Loader2 className="animate-spin" size={32} />
                <p className="font-medium">Reading your resume and extracting skills…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload className="text-signal" size={32} />
                </motion.div>
                <p className="font-medium">Drop your resume here, or click to browse</p>
                <p className="text-muted text-sm">PDF only, up to a few MB</p>
              </div>
            )}
          </motion.div>
        </TiltCard>
      )}

      {status === "error" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-confidence/30 bg-confidence/10 px-4 py-3 text-confidence text-sm">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <AnimatePresence>
        {status === "done" && parsed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-pass/30 bg-pass/5 p-6"
          >
            <div className="flex items-center gap-2 text-pass mb-4">
              <CheckCircle2 size={18} />
              <span className="font-medium">Resume parsed successfully</span>
            </div>

            {parsed.skills?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm text-muted mb-2">Skills detected</p>
                <div className="flex flex-wrap gap-2">
                  {parsed.skills.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-mono bg-panel2 border border-border rounded-full px-3 py-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsed.projects?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-muted mb-2">Projects found</p>
                <div className="space-y-3">
                  {parsed.projects.map((p, i) => (
                    <div key={i} className="rounded-lg bg-panel2 border border-border p-3">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <FileText size={14} className="text-signal" /> {p.title}
                      </p>
                      <p className="text-muted text-xs mt-1">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---- Start Interview section ---- */}
            <div className="border-t border-border pt-5 mt-2">
              <p className="text-sm font-medium mb-3">Ready to practice?</p>

              <p className="text-xs text-muted mb-2">Round type</p>
              <div className="flex gap-2 mb-4">
                {(["technical", "hr"] as const).map((r) => (
                  <motion.button
                    key={r}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setRoundType(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      roundType === r
                        ? "bg-signal border-signal text-white"
                        : "border-border text-muted hover:text-ink"
                    }`}
                  >
                    {r === "technical" ? "Technical" : "HR"}
                  </motion.button>
                ))}
              </div>

              <p className="text-xs text-muted mb-2">Number of questions</p>
              <div className="flex gap-2 mb-5">
                {([5, 8, 12] as const).map((n) => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setQuestionCount(n)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      questionCount === n
                        ? "bg-signal border-signal text-white"
                        : "border-border text-muted hover:text-ink"
                    }`}
                  >
                    {n} questions
                  </motion.button>
                ))}
              </div>

              <MagneticButton
                onClick={startInterview}
                className="flex items-center gap-2 rounded-lg bg-confidence text-white font-medium px-5 py-2.5 hover:bg-confidence/90 disabled:opacity-50"
              >
                {starting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Play size={16} />
                )}
                {starting ? "Starting…" : "Start Interview"}
              </MagneticButton>

              {errorMsg && (
                <p className="text-confidence text-xs mt-3">{errorMsg}</p>
              )}
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setResume(null);
              }}
              className="text-signal text-sm hover:underline mt-5 block"
            >
              Upload a different resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
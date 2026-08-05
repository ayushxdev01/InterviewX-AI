"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, X, Pencil, Check, Download, Video, VideoOff } from "lucide-react";
import jsPDF from "jspdf";

type Message = { role: "ai" | "user"; content: string; isNewQuestion?: boolean };

export default function InterviewChat({
  interview,
}: {
  interview: {
    id: string;
    messages: Message[];
    question_count: number;
    status: string;
  };
}) {
  const [messages, setMessages] = useState<Message[]>(interview.messages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(interview.status === "completed");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const questionsAsked = messages.filter(
    (m) => m.role === "ai" && m.isNewQuestion !== false
  ).length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Stop the camera stream when leaving the page
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    // Attach the stream to the <video> element only after it has actually mounted
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  async function toggleCamera() {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraOn(false);
      return;
    }
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setCameraError("Couldn't access your camera. Check browser permissions.");
    }
  }

  async function handleEditSave(index: number) {
    if (!editValue.trim() || sending) return;
    const newAnswer = editValue.trim();

    // Optimistically rewind the visible conversation to this point
    setMessages((prev) => [
      ...prev.slice(0, index),
      { role: "user", content: newAnswer },
    ]);
    setEditingIndex(null);
    setSending(true);

    try {
      const res = await fetch(`/api/interview/${interview.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIndex: index, newAnswer }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Couldn't regenerate from that edit. Please try again." },
        ]);
        setSending(false);
        return;
      }

      setMessages(data.interview.messages);
      setDone(data.done);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Connection issue — please try that edit again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function downloadTranscript() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFontSize(16);
    doc.text("Interview Transcript — InterviewX AI", margin, y);
    y += 10;

    doc.setFontSize(11);
    messages.forEach((m) => {
      const label = m.role === "ai" ? "Interviewer:" : "You:";
      const lines = doc.splitTextToSize(`${label} ${m.content}`, pageWidth - margin * 2);
      if (y + lines.length * 6 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin, y);
      y += lines.length * 6 + 4;
    });

    doc.save("interview-transcript.pdf");
  }

  async function handleSend() {
    if (!input.trim() || sending || done) return;
    const answer = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/interview/${interview.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Something went wrong generating the next question. Please try again." },
        ]);
        setSending(false);
        return;
      }

      setMessages(data.interview.messages);
      if (data.done) setDone(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Connection issue — please try sending that again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[75vh] rounded-xl border border-border bg-panel/10 backdrop-blur-md overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-border bg-panel2/30 backdrop-blur-md flex items-center justify-between">
        <span className="font-mono text-xs text-muted">interview_session.ai</span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-signal">
            Question {Math.min(questionsAsked, interview.question_count)} / {interview.question_count}
          </span>
          <button
            onClick={toggleCamera}
            className="flex items-center gap-1 text-xs text-muted hover:text-signal transition-colors"
            title="Practice with your camera on (just a self-view, nothing is recorded or analyzed)"
          >
            {cameraOn ? <VideoOff size={14} /> : <Video size={14} />}
            {cameraOn ? "Camera off" : "Camera"}
          </button>
          {!done && (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-1 text-xs text-muted hover:text-confidence transition-colors"
            >
              <X size={14} /> Exit
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="px-5 py-2 bg-confidence/10 border-b border-confidence/30 text-xs text-confidence">
          {cameraError}
        </div>
      )}

      {cameraOn && (
        <div className="px-5 pt-3">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-40 rounded-lg border border-border scale-x-[-1]"
          />
          <p className="text-[11px] text-muted mt-1">
            Self-view only — nothing is recorded or sent anywhere.
          </p>
        </div>
      )}

      {showExitConfirm && (
        <div className="px-5 py-3 bg-confidence/10 border-b border-confidence/30 flex items-center justify-between">
          <p className="text-sm text-confidence">Leave this interview? Your progress is saved.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm font-medium text-confidence hover:underline"
            >
              Yes, exit
            </button>
            <button
              onClick={() => setShowExitConfirm(false)}
              className="text-sm text-muted hover:text-ink"
            >
              Stay
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} group`}
          >
            {editingIndex === i ? (
              <div className="max-w-[80%] w-full flex flex-col gap-2 items-end">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={2}
                  autoFocus
                  className="w-full resize-none rounded-lg bg-panel2 border border-signal px-3 py-2 text-sm outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="text-xs text-muted hover:text-ink px-2 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(i)}
                    className="flex items-center gap-1 text-xs bg-signal text-white rounded-md px-3 py-1 hover:bg-signal/90"
                  >
                    <Check size={12} /> Save & regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {m.role === "user" && !done && !sending && (
                  <button
                    onClick={() => {
                      setEditingIndex(i);
                      setEditValue(m.content);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-signal"
                    title="Edit this answer"
                  >
                    <Pencil size={13} />
                  </button>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    m.role === "ai"
                    ? "bg-panel2/40 backdrop-blur-sm border border-border text-ink"
                    : "bg-signal text-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-muted text-sm">
            <Loader2 className="animate-spin" size={14} /> Thinking of the next question…
          </div>
        )}

        {done && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-pass/30 bg-pass/10 p-6 mt-6">
            <CheckCircle2 className="text-pass" size={28} />
            <p className="text-pass font-medium">Interview complete!</p>
            <p className="text-muted text-sm text-center">
              Let's see how you did.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/interview/${interview.id}/report`)}
                className="rounded-lg bg-signal text-white text-sm font-medium px-5 py-2.5 hover:bg-signal/90 transition-colors"
              >
                View Feedback Report
              </button>
              <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.96 }}
  onClick={downloadTranscript}
  className="flex items-center gap-2 rounded-lg border border-border text-sm px-4 py-2.5 hover:border-signal/40 transition-colors"
>
  <Download size={15} /> Transcript
</motion.button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!done && (
        <div className="p-4 border-t border-border flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your answer…"
            rows={2}
            className="flex-1 resize-none rounded-lg bg-panel2 border border-border px-3 py-2 text-sm outline-none focus:border-signal"
          />
          <motion.button
            whileHover={{ scale: sending || !input.trim() ? 1 : 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="rounded-lg bg-signal px-4 disabled:opacity-40 hover:bg-signal/90 transition-colors"
          >
            <Send size={18} className="text-white" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Mic,
  BarChart3,
  Code2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { MagneticButton } from "./components/MagneticButton";
import { TiltCard } from "./components/TiltCard";
import { Logo } from "./components/Logo";
import { Scene3D } from "./components/Scene3D";
import { ThemeToggle } from "./components/ThemeToggle";

function InterviewTerminal() {
  const script = [
    { role: "ai", text: "I see you built a React + Node job board. Walk me through how you handled real-time updates." },
    { role: "user", text: "I used WebSockets with a pub/sub layer so..." },
    { role: "feedback", text: "Strong system design instinct. Communication: 8.4/10" },
  ];
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= script.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 1400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <TiltCard maxTilt={6} className="w-full max-w-md rounded-xl">
      <div className="absolute -inset-[1px] rounded-xl opacity-60 animate-[spin_6s_linear_infinite] [background:conic-gradient(from_0deg,transparent_0%,#5B8DEF_15%,transparent_35%)] pointer-events-none" />
      <div className="relative rounded-xl border border-border bg-panel shadow-2xl shadow-black/40 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-panel2">
          <span className="w-3 h-3 rounded-full bg-confidence/70" />
          <span className="w-3 h-3 rounded-full bg-signal/70" />
          <span className="w-3 h-3 rounded-full bg-pass/70" />
          <span className="ml-2 text-xs text-muted font-mono">interview_session.ai</span>
        </div>
        <div className="p-5 space-y-4 min-h-[260px] font-mono text-sm">
          {script.slice(0, visible).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {line.role === "ai" && (
                <p className="text-signal">
                  <span className="text-muted">AI ▸</span> {line.text}
                </p>
              )}
              {line.role === "user" && (
                <p className="text-ink">
                  <span className="text-muted">You ▸</span> {line.text}
                </p>
              )}
              {line.role === "feedback" && (
                <div className="flex items-center gap-2 mt-2 rounded-lg border border-pass/30 bg-pass/10 px-3 py-2 text-pass">
                  <CheckCircle2 size={16} />
                  <span>{line.text}</span>
                </div>
              )}
            </motion.div>
          ))}
          {visible < script.length && (
            <span className="inline-block w-2 h-4 bg-signal animate-blink" />
          )}
        </div>
      </div>
    </TiltCard>
  );
}

function NavBar() {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/60">
      <div className="flex items-center gap-2 font-display font-semibold text-lg">
        <Logo size={26} />
        InterviewX <span className="text-signal">AI</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-muted">
        <a href="#features" className="hover:text-ink transition-colors">Features</a>
        <a href="#how" className="hover:text-ink transition-colors">How it works</a>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <MagneticButton
          onClick={() => router.push("/login")}
          className="rounded-lg bg-signal font-medium text-sm px-4 py-2 hover:bg-signal/90 text-white [--tw-shadow-color:theme(colors.signal)]"
        >
          Get Started
        </MagneticButton>
      </div>
    </nav>
  );
}

function Hero() {
  const router = useRouter();
  return (
    <section className="grid-texture relative px-6 md:px-12 pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-signal border border-signal/30 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
            resume-aware · voice-analyzed · AI-scored
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] mb-6 overflow-hidden">
            <span className="block overflow-hidden">
              {"Practice interviews".split(" ").map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden">
              {["like", "the", "real", "thing."].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block mr-3 ${word === "real" || word === "thing." ? "text-signal" : ""}`}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>
          <p className="text-muted text-lg max-w-md mb-8">
            Upload your resume. Get questions built from your own projects.
            Get scored like a real recruiter is in the room — because the AI
            actually read your code.
          </p>
          <div className="flex items-center gap-4">
            <MagneticButton
              onClick={() => router.push("/login")}
              className="rounded-lg bg-confidence font-medium px-6 py-3 hover:bg-confidence/90 text-white shadow-lg shadow-confidence/20 hover:shadow-confidence/40"
            >
              Start free mock interview <ArrowRight size={18} />
            </MagneticButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex justify-center md:justify-end"
        >
          <InterviewTerminal />
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: FileText,
    title: "Resume-aware questions",
    desc: "The AI parses your actual resume — projects, stack, experience — and interviews you on what you really built.",
  },
  {
    icon: Code2,
    title: "Live coding rounds",
    desc: "Solve problems in a real editor, then get AI code review on complexity, edge cases, and clean-code practice.",
  },
  {
    icon: Mic,
    title: "Voice-based delivery scoring",
    desc: "Speak your answers. Get scored on clarity, pacing, filler words, and confidence — not just correctness.",
  },
  {
    icon: BarChart3,
    title: "Progress you can see",
    desc: "Every session updates your topic-wise strengths and weaknesses, so you know exactly what to fix next.",
  },
];

function Features() {
  return (
    <section id="features" className="px-6 md:px-12 py-24 border-t border-border/60">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
          Built like a hiring pipeline,
          <br className="hidden md:block" /> not a quiz app.
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <TiltCard maxTilt={8} className="rounded-xl border border-border bg-panel p-6 hover:border-signal/40 transition-colors h-full">
                <f.icon className="text-signal mb-4" size={26} />
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { label: "Upload", detail: "Drop your resume — AI extracts skills, projects, and experience in seconds." },
    { label: "Interview", detail: "Answer resume-aware HR, technical, and coding questions in a live session." },
    { label: "Improve", detail: "Get a detailed report and a personalized plan for what to study next." },
  ];
  return (
    <section id="how" className="px-6 md:px-12 py-24 border-t border-border/60">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-12 text-center">
          Three steps. Real feedback.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.label} className="relative">
              <div className="font-mono text-signal text-sm mb-3">0{i + 1}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.label}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 md:px-12 py-10 border-t border-border/60 flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 font-display font-semibold">
          <Logo size={20} />
          InterviewX AI
        </div>
        <p className="text-muted text-sm">Practice. Analyze. Improve. Get Hired.</p>
      </div>
      <p className="text-sm text-muted">
        Developed by{" "}
        <a
          href="https://github.com/ayushxdev01"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-signal hover:underline"
        >
          Ayush Gupta
        </a>
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <Scene3D opacity={0.5} />
      <NavBar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import SignOutButton from "./sign-out-button";
import ResumeUpload from "./resume-upload";
import DashboardIntro from "./dashboard-intro";
import DashboardAnalytics from "./dashboard-analytics";
import { Scene3D } from "../components/Scene3D";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingResume } = await supabase
    .from("resumes")
    .select("id, parsed_data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: pastInterviews } = await supabase
    .from("interviews")
    .select("created_at, round_type, feedback")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen grid-texture relative overflow-hidden">
      <Scene3D opacity={0.9} />
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/60">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <Logo size={26} />
          InterviewX <span className="text-signal">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
        <DashboardIntro name={user.user_metadata?.full_name || user.email} />
        <DashboardAnalytics interviews={pastInterviews || []} />
        <ResumeUpload initialResume={existingResume} />
      </div>

      <footer className="px-6 md:px-12 py-8 border-t border-border/60 flex justify-center">
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
    </main>
  );
}
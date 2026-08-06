import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "../../../components/Logo";
import ReportView from "./report-view";
import { BackgroundMedia } from "../../../components/BackgroundMedia";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!interview) redirect("/dashboard");
  if (interview.status !== "completed") redirect(`/interview/${id}`);

  return (
    <main className="min-h-screen grid-texture">
      <BackgroundMedia src="/backgrounds/feedback-bg.png" />
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/60">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <Logo size={26} />
          InterviewX <span className="text-signal">AI</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <ReportView interviewId={interview.id} initialFeedback={interview.feedback} />
      </div>
    </main>
  );
}
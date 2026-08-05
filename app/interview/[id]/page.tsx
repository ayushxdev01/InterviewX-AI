import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Logo } from "../../components/Logo";
import { Scene3D } from "../../components/Scene3D";
import { ThemeToggle } from "../../components/ThemeToggle";
import InterviewChat from "./interview-chat";

export default async function InterviewPage({
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

  return (
    <main className="min-h-screen grid-texture relative overflow-hidden">
      <Scene3D opacity={0.45} />
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/60">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <Logo size={26} />
          InterviewX <span className="text-signal">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-xs font-mono text-muted uppercase">
            {interview.round_type} round
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <InterviewChat interview={interview} />
      </div>
    </main>
  );
}
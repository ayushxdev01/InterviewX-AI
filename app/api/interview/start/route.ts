import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function askGroq(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { resumeId, roundType, questionCount } = await request.json();

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Look at recent past interviews to avoid asking the same opening questions again
  const { data: pastInterviews } = await supabase
    .from("interviews")
    .select("messages")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const pastQuestions = (pastInterviews || [])
    .flatMap((iv: any) => iv.messages)
    .filter((m: any) => m.role === "ai" && m.isNewQuestion !== false)
    .map((m: any) => m.content);

  const avoidBlock =
    pastQuestions.length > 0
      ? `\nIMPORTANT: This candidate has done practice interviews before. Do NOT repeat any of these previously asked questions, and pick a genuinely different opening angle, project, or topic than these:\n${pastQuestions
          .map((q: string, i: number) => `${i + 1}. ${q}`)
          .join("\n")}`
      : "";

  const systemPrompt = `You are a senior technical interviewer conducting a ${roundType} interview.
The candidate's resume data: ${JSON.stringify(resume.parsed_data)}.
Ask exactly one question at a time, referencing specific projects, skills, or experience from their resume where relevant.
IMPORTANT: Only reference facts, numbers, and details that are explicitly present in the resume data above. Never invent metrics, numbers, or specifics (like response times, percentages, or dates) that are not stated in the resume — ask about them as open questions instead (e.g. "how did you measure performance?" rather than assuming a specific number).
IMPORTANT: In later turns of this conversation, if the candidate gives a vague, low-effort, or off-topic answer (e.g. "yes", "ok", a one-word reply, or nonsense text), do not move to a new topic — ask them to elaborate on the same question instead.${avoidBlock}
Keep questions concise (1-3 sentences). Do not number the questions. Do not give feedback yet — just ask.
This is question 1 of ${questionCount}.`;

  let firstQuestion = "";
  try {
    firstQuestion = await askGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Start the interview with your first question." },
    ]);
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate question. Try again." }, { status: 500 });
  }

  const { data: interview, error } = await supabase
    .from("interviews")
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      round_type: roundType,
      question_count: questionCount,
      messages: [{ role: "ai", content: firstQuestion, isNewQuestion: true }],
      status: "in_progress",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interview });
}
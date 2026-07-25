import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function askGroqJSON(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "{}";
  return JSON.parse(content);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: interview } = await supabase
    .from("interviews")
    .select("*, resumes(parsed_data)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  if (interview.status !== "completed") {
    return NextResponse.json({ error: "Interview isn't finished yet" }, { status: 400 });
  }

  if (interview.feedback) {
    return NextResponse.json({ feedback: interview.feedback });
  }

  const transcript = interview.messages
    .map((m: any) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n\n");

  const systemPrompt = `You are an expert technical interview coach reviewing a completed ${interview.round_type} interview transcript.
Candidate's resume data: ${JSON.stringify(interview.resumes?.parsed_data)}.

Evaluate the candidate's performance based ONLY on what they actually said in the transcript below. Do not invent facts.
IMPORTANT: The candidate may use current industry slang or informal terms. Common ones you should recognize as legitimate (not flag as confusing): "vibe coding" (writing code by iterating quickly with AI/LLM assistance), "prompt engineering", "RAG" (Retrieval-Augmented Generation), "agentic AI", "context window". Only flag genuinely unclear or nonsensical language, not modern tech terminology.

Respond ONLY with a JSON object in this exact shape:
{
  "overall_score": <number 0-100>,
  "technical_score": <number 0-100>,
  "communication_score": <number 0-100>,
  "summary": "<2-3 sentence overall summary of how they did>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", ...],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", ...],
  "improvement_tips": ["<concrete, actionable tip 1>", "<concrete tip 2>", ...],
  "consistency_note": "<optional: if one or more answers were notably more polished, formal, or structured in tone/vocabulary compared to the candidate's other answers in this same conversation, gently note it as a suggestion to keep their natural voice consistent. Do NOT accuse them of using AI — just note the tone shift as an observation. Leave this as an empty string if nothing stands out.>"
}

Base scores on: depth and accuracy of technical answers, clarity of communication, how well they explained their own projects, and whether they engaged substantively (not vague/low-effort answers).
Give 2-5 items in each of strengths, weaknesses, and improvement_tips. Be honest and specific — reference actual things they said or failed to explain.`;

  let feedback;
  try {
    feedback = await askGroqJSON([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Transcript:\n\n${transcript}` },
    ]);
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate feedback. Try again." }, { status: 500 });
  }

  const { error } = await supabase
    .from("interviews")
    .update({ feedback })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feedback });
}
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
      temperature: 0.6,
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
  return JSON.parse(content) as {
    message: string;
    is_new_question: boolean;
    end_interview?: boolean;
  };
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

  const { answer } = await request.json();

  const { data: interview } = await supabase
    .from("interviews")
    .select("*, resumes(parsed_data)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  const messages = [...interview.messages, { role: "user", content: answer }];

  const questionsAskedSoFar = messages.filter(
    (m: any) => m.role === "ai" && m.isNewQuestion !== false
  ).length;

  let elaborationStreak = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m: any = messages[i];
    if (m.role === "ai") {
      if (m.isNewQuestion === false) elaborationStreak++;
      else break;
    }
  }

  if (questionsAskedSoFar >= interview.question_count) {
    const { data: updated, error } = await supabase
      .from("interviews")
      .update({ messages, status: "completed" })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ interview: updated, done: true });
  }

  const systemPrompt = `You are a senior ${interview.round_type} interviewer.
Candidate's resume data: ${JSON.stringify(interview.resumes?.parsed_data)}.
You are on question ${questionsAskedSoFar + 1} of ${interview.question_count}.
You have already asked the candidate to elaborate on the CURRENT question ${elaborationStreak} time(s).
IMPORTANT: Only reference facts, numbers, and details that are explicitly present in the resume data or in what the candidate has actually said in this conversation. Never invent metrics, numbers, or specifics that weren't stated.
IMPORTANT: Look at the candidate's most recent answer. If it is vague, low-effort, off-topic, unreadable, or doesn't actually address the question (e.g. "yes", "ok", "sure", a one-word reply, or nonsense text), do NOT move to a new topic — instead, politely ask them to elaborate on the SAME question. Only move to a new question once they've given a substantive answer.
IMPORTANT: If you have ALREADY asked for elaboration on this same question 2 or more times (elaborationStreak >= 2) and the candidate's latest answer is still vague or low-effort, do NOT ask again. Instead, gracefully end the interview with a short, polite closing line (e.g. "That's all for today — thank you for your time!"), and set "end_interview" to true.
IMPORTANT: Review the earlier questions in this conversation and make sure your next question covers a genuinely different topic, project, or angle — do not repeat or lightly rephrase something already asked.
IMPORTANT: The candidate may use current industry slang or informal terms. You actually know what these common ones mean, so don't ask them to define these — just engage naturally: "vibe coding" (writing code by iterating quickly with AI/LLM assistance rather than manually, often with less rigorous planning), "prompt engineering" (crafting inputs to get better outputs from an LLM), "RAG" (Retrieval-Augmented Generation — combining a knowledge base with an LLM), "agentic AI" (AI systems that can autonomously take multi-step actions), "context window" (the amount of text an LLM can process at once). For any OTHER term you genuinely don't recognize, don't assume it's invalid — ask a brief, natural clarifying question only if truly needed.
Respond ONLY with a JSON object in this exact shape: {"message": "<your response text, 1-3 sentences, no numbering>", "is_new_question": true or false, "end_interview": true or false}.
Set "is_new_question" to false if your message is asking the candidate to elaborate/clarify their previous answer. Set it to true only if your message introduces a genuinely new question or topic, or if you are ending the interview.
Set "end_interview" to true only in the case described above. Otherwise set it to false.
Do not give feedback or scores in this response — just ask (or close out, if ending).`;

  const conversationForModel = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  let result: { message: string; is_new_question: boolean; end_interview?: boolean };
  try {
    result = await askGroqJSON(conversationForModel);
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate next question." }, { status: 500 });
  }

  const updatedMessages = [
    ...messages,
    { role: "ai", content: result.message, isNewQuestion: result.is_new_question },
  ];

  const { data: updated, error } = await supabase
    .from("interviews")
    .update({
      messages: updatedMessages,
      status: result.end_interview ? "completed" : "in_progress",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ interview: updated, done: !!result.end_interview });
}
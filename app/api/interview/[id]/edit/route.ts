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
  return JSON.parse(content) as { message: string; is_new_question: boolean };
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

  const { messageIndex, newAnswer } = await request.json();

  const { data: interview } = await supabase
    .from("interviews")
    .select("*, resumes(parsed_data)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  if (
    typeof messageIndex !== "number" ||
    interview.messages[messageIndex]?.role !== "user"
  ) {
    return NextResponse.json({ error: "Invalid message to edit" }, { status: 400 });
  }

  const rewound = [
    ...interview.messages.slice(0, messageIndex),
    { role: "user", content: newAnswer },
  ];

  const questionsAskedSoFar = rewound.filter(
    (m: any) => m.role === "ai" && m.isNewQuestion !== false
  ).length;

  if (questionsAskedSoFar >= interview.question_count) {
    const { data: updated, error } = await supabase
      .from("interviews")
      .update({ messages: rewound, status: "completed" })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ interview: updated, done: true });
  }

  const systemPrompt = `You are a senior ${interview.round_type} interviewer.
Candidate's resume data: ${JSON.stringify(interview.resumes?.parsed_data)}.
You are on question ${questionsAskedSoFar + 1} of ${interview.question_count}.
The candidate just revised one of their earlier answers, so continue naturally from here.
IMPORTANT: Only reference facts, numbers, and details that are explicitly present in the resume data or in what the candidate has actually said. Never invent metrics or specifics that weren't stated.
IMPORTANT: If the candidate's revised answer is still vague, low-effort, off-topic, or doesn't address the question (e.g. "yes", "ok", a one-word reply, or nonsense text), do NOT move to a new topic — ask them to elaborate on the same question instead.
Respond ONLY with a JSON object in this exact shape: {"message": "<your response text, 1-3 sentences, no numbering>", "is_new_question": true or false}.
Set "is_new_question" to false if your message is asking the candidate to elaborate/clarify. Set it to true only if it introduces a genuinely new question or topic.
Do not give feedback or scores in this response — just ask.`;

  const conversationForModel = [
    { role: "system", content: systemPrompt },
    ...rewound.map((m: any) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  let result: { message: string; is_new_question: boolean };
  try {
    result = await askGroqJSON(conversationForModel);
  } catch (e) {
    return NextResponse.json({ error: "Failed to regenerate the next question." }, { status: 500 });
  }

  const updatedMessages = [
    ...rewound,
    { role: "ai", content: result.message, isNewQuestion: result.is_new_question },
  ];

  const { data: updated, error } = await supabase
    .from("interviews")
    .update({ messages: updatedMessages, status: "in_progress" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ interview: updated, done: false });
}
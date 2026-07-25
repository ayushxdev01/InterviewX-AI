import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  let rawText = "";
  try {
    const parsed = await pdfParse(buffer);
    rawText = parsed.text;
  } catch (e) {
    return NextResponse.json({ error: "Could not read PDF. Try a different file." }, { status: 400 });
  }

  if (!rawText || rawText.trim().length < 40) {
    return NextResponse.json(
      { error: "Couldn't find readable text in this PDF (it may be a scanned image)." },
      { status: 400 }
    );
  }

  const filePath = `${user.id}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, buffer, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  let parsedData = null;
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a resume parser. Extract structured data from the resume text and return ONLY valid JSON (no markdown, no commentary) matching this exact shape: " +
              `{"name": string, "skills": string[], "projects": [{"title": string, "description": string, "tech": string[]}], "experience": [{"role": string, "company": string, "duration": string}], "education": [{"degree": string, "institution": string, "year": string}]}` +
              " If a field is not found, use an empty string or empty array. Do not invent information that isn't in the text.",
          },
          {
            role: "user",
            content: rawText.slice(0, 12000),
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", errText);
    } else {
      const groqData = await groqRes.json();
      const content = groqData.choices?.[0]?.message?.content;
      parsedData = content ? JSON.parse(content) : null;
    }
  } catch (e) {
    console.error("Groq parsing failed:", e);
  }

  const { data: resumeRow, error: dbError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      file_path: filePath,
      file_name: file.name,
      raw_text: rawText,
      parsed_data: parsedData,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ resume: resumeRow });
}
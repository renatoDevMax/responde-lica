import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    const embedding = response.data[0].embedding;

    return NextResponse.json({ embedding });
  } catch (error) {
    console.error("Erro ao gerar embedding:", error);
    return NextResponse.json(
      { error: "Erro ao gerar embedding" },
      { status: 500 }
    );
  }
}

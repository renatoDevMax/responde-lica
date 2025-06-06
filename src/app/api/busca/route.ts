import { buscarProdutosCompleto } from "@/app/services/busca";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { texto } = await request.json();

    if (!texto) {
      return NextResponse.json(
        { error: "Texto é obrigatório" },
        { status: 400 }
      );
    }

    const produtos = await buscarProdutosCompleto(texto);
    return NextResponse.json({ produtos });
  } catch (error) {
    console.error("Erro na API de busca:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

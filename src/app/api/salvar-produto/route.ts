import { NextResponse } from "next/server";
import { salvarProdutoNoPinecone } from "../../services/pinecone";

export async function POST(request: Request) {
  try {
    const produto = await request.json();

    await salvarProdutoNoPinecone(produto);

    return NextResponse.json({
      success: true,
      message: "Produto salvo com sucesso no Pinecone",
    });
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return NextResponse.json(
      { error: "Erro ao salvar produto no Pinecone" },
      { status: 500 }
    );
  }
}

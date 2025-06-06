import { NextResponse } from "next/server";
import { openai, CHAT_CONFIG } from "../../lib/openai-config";
import {
  processarMensagemUsuario,
  gerarPromptSistema,
} from "../../services/logicaConversa";
import { ProdutoFinal } from "../../services/busca";

// Importa a função para escolher o produto correto
import { escolherProdutoParaCard } from "../../services/logicaConversa";

interface ObjetoResposta {
  mensagem: string;
  objetoProdutoFinal?: ProdutoFinal;
}

export async function POST(req: Request) {
  try {
    const { messages, produtoAtual } = await req.json();
    const ultimaMensagem = messages[messages.length - 1];

    // Sempre processa a mensagem do usuário para ver se ele quer um novo produto
    const contexto = await processarMensagemUsuario(
      ultimaMensagem.content,
      {
        mensagens: messages.slice(0, -1),
      },
      produtoAtual
    );

    // Se encontrou um novo produto, usa ele
    // Se não encontrou e tem produto atual, usa o atual
    const produtosParaPrompt = contexto.produtosRelevantes?.length
      ? contexto.produtosRelevantes
      : produtoAtual
      ? [produtoAtual]
      : [];

    const systemPrompt = gerarPromptSistema(produtosParaPrompt);

    const completion = await openai.chat.completions.create({
      ...CHAT_CONFIG,
      messages: [
        { role: "system", content: systemPrompt },
        ...contexto.mensagens,
        { role: "user", content: ultimaMensagem.content },
      ],
    });

    const respostaTexto =
      completion.choices[0].message.content ||
      "Desculpe, não consegui processar sua pergunta.";

    // Usa a função para escolher o produto correto para o card
    let produtoParaCard = undefined;
    if (produtosParaPrompt.length > 0) {
      // Importa dinamicamente se necessário
      const { escolherProdutoParaCard } = await import(
        "../../services/logicaConversa"
      );
      produtoParaCard = escolherProdutoParaCard(
        respostaTexto,
        produtosParaPrompt
      );
    }

    const resposta: ObjetoResposta = {
      mensagem: respostaTexto,
      objetoProdutoFinal:
        produtoParaCard || produtosParaPrompt[0] || produtoAtual,
    };

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar sua mensagem" },
      { status: 500 }
    );
  }
}

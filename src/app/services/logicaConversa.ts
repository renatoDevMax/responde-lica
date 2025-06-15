import { buscarProdutosCompleto } from "./busca";
import { openai } from "../lib/openai-config";

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

interface ContextoConversa {
  mensagens: Mensagem[];
  produtosRelevantes?: any[];
}

async function analisarInteresseNovoProduto(
  mensagem: string,
  produtoAtual: any
): Promise<boolean> {
  const prompt = `Analise a seguinte mensagem do usuário e determine se ela está perguntando sobre um produto DIFERENTE do produto atual.

PRODUTO ATUAL:
Nome: ${produtoAtual.nome}
Descrição: ${produtoAtual.descricao}

MENSAGEM DO USUÁRIO:
"${mensagem}"

Considere que o usuário está interessado em um NOVO produto quando:
1. Pergunta sobre um produto diferente do atual
2. Usa frases como "tem algum", "você vende", "quero comprar", "preciso de"
3. Menciona características ou tipos de produtos diferentes do atual
4. Faz perguntas sobre outros produtos ou categorias
5. Usa palavras como "outro", "diferente", "além", "também"

Considere que o usuário ainda está interessado no produto ATUAL quando:
1. Faz perguntas sobre como usar o produto atual
2. Pergunta sobre características específicas do produto atual
3. Quer mais detalhes sobre o produto atual
4. Pergunta sobre preço, disponibilidade ou onde encontrar o produto atual
5. Usa palavras como "este", "esse", "ele", "o mesmo"

Responda apenas com "NOVO" se o usuário estiver interessado em um produto diferente, ou "ATUAL" se ainda estiver falando sobre o produto atual.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 10,
  });

  const resposta = completion.choices[0].message.content?.toLowerCase().trim();
  return resposta === "novo";
}

async function deveBuscarProdutos(mensagem: string): Promise<boolean> {
  const prompt = `Analise a seguinte mensagem do usuário e determine se ela está perguntando sobre produtos específicos de limpeza que precisam ser buscados no catálogo.
Considere que devemos buscar produtos quando o usuário:
- Pergunta sobre um produto específico
- Quer saber preços
- Quer saber onde encontrar um produto
- Quer saber como usar um produto específico
- Pergunta sobre características específicas de um produto
- Usa frases como "tem algum", "você vende", "quero comprar", "preciso de"
- Usa palavras como "outro", "diferente", "além", "também"

Mensagem do usuário: "${mensagem}"

Responda apenas com "SIM" se precisar buscar produtos, ou "NAO" se for uma pergunta geral sobre limpeza.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 10,
  });

  const resposta = completion.choices[0].message.content?.toLowerCase().trim();
  return resposta === "sim";
}

// Função para escolher o produto mencionado na resposta
export function escolherProdutoParaCard(
  resposta: string,
  produtos: any[]
): any {
  if (!produtos || produtos.length === 0) return undefined;
  const respostaLower = resposta.toLowerCase();
  // Procura pelo produto cujo nome aparece na resposta
  const produtoEncontrado = produtos.find((produto) =>
    respostaLower.includes(produto.nome.toLowerCase())
  );
  return produtoEncontrado || produtos[0];
}

export async function processarMensagemUsuario(
  mensagem: string,
  contexto: ContextoConversa,
  produtoAtual?: any
): Promise<
  ContextoConversa & { produtoParaCard?: any; respostaModelo?: string }
> {
  try {
    let produtosRelevantes = undefined;
    let respostaModelo = "";
    let produtoParaCard = undefined;

    // Se tiver um produto atual, verifica se o usuário quer um novo produto
    if (produtoAtual) {
      const querNovoProduto = await analisarInteresseNovoProduto(
        mensagem,
        produtoAtual
      );
      if (querNovoProduto) {
        console.log("Usuário quer um novo produto, buscando...");
        produtosRelevantes = await buscarProdutosCompleto(mensagem, contexto);
      } else {
        console.log("Usuário ainda está interessado no produto atual");
        produtosRelevantes = [produtoAtual];
      }
    } else {
      // Se não tiver produto atual, verifica se deve buscar produtos
      if (await deveBuscarProdutos(mensagem)) {
        console.log("Buscando produtos para nova consulta...");
        produtosRelevantes = await buscarProdutosCompleto(mensagem, contexto);
      }
    }

    // Adiciona a mensagem do usuário ao contexto
    const novoContexto: ContextoConversa = {
      mensagens: [...contexto.mensagens, { role: "user", content: mensagem }],
      produtosRelevantes,
    };

    // Se houver produtos relevantes, gere o prompt e obtenha a resposta do modelo
    if (produtosRelevantes && produtosRelevantes.length > 0) {
      const promptSistema = gerarPromptSistema(produtosRelevantes);
      // Aqui você deve chamar o modelo e obter a resposta
      // Exemplo:
      // respostaModelo = await chamarModeloOpenAI(mensagem, promptSistema);
      // Como não temos o código exato da chamada, mantenha o fluxo original
      // produtoParaCard = escolherProdutoParaCard(respostaModelo, produtosRelevantes);
    }

    // Retorne o contexto, e também o produtoParaCard e a respostaModelo se desejar
    return { ...novoContexto, produtoParaCard, respostaModelo };
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    throw new Error("Não foi possível processar a mensagem do usuário");
  }
}

export function gerarPromptSistema(produtosRelevantes: any[]): string {
  if (!produtosRelevantes || produtosRelevantes.length === 0) {
    return `Você é uma especialista em produtos de limpeza, chamada Lica. Sua função é ajudar os usuários com dúvidas sobre produtos de limpeza.

IMPORTANTE: Seja conciso e direto em suas respostas. Forneça apenas as informações essenciais, a menos que o usuário peça mais detalhes.

IMPORTANTE: Sempre inicie sua resposta com uma frase que termine com ponto de exclamação (!). Esta frase deve refletir o contexto da sua resposta, por exemplo:
- "Depois de uma busca, finalmente encontrei seu produto!"
- "Que pena, acho que não tenho nenhum produto assim!"
- "Pensei muito, e finalmente encontrei sua solução!"
- "Analisei com cuidado e tenho a resposta perfeita para você!"

IMPORTANTE: Nunca deixe a primeira frase da sua resposta finalizar com dois pontos (:).

Após esta frase inicial, continue com sua resposta normalmente.

`;
  }
  //comentario qualquer
  const informacoesProdutos = produtosRelevantes
    .map(
      (produto) => `
Produto: ${produto.nome}
Descrição: ${produto.descricao}
Como usar: ${produto.comoUsar}
Preço: R$ ${produto.preco}
`
    )
    .join("\n");

  return `Você é uma especialista em produtos de limpeza, chamada Lica. Use as seguintes informações sobre produtos para responder às dúvidas do usuário:

${informacoesProdutos}

DIRETRIZES DE RESPOSTA:
1. Seja conciso e direto em suas respostas gerais
2. Forneça detalhes completos APENAS quando:
   - Explicar como usar um produto
   - Descrever características específicas de um produto
   - Responder perguntas técnicas sobre produtos
3. Para perguntas simples, responda de forma breve e objetiva
4. Se o usuário pedir mais detalhes, então forneça informações mais completas

IMPORTANTE: Formate suas respostas usando markdown:
- Use **negrito** para títulos e palavras importantes
- Use listas numeradas (1., 2., 3.) para instruções passo a passo
- Use listas com marcadores (-) para itens sem ordem específica
- Adicione quebras de linha entre parágrafos
- Use *itálico* para ênfase em informações secundárias

IMPORTANTE: Sempre inicie sua resposta com uma frase que termine com ponto de exclamação (!). Esta frase deve refletir o contexto da sua resposta, por exemplo:
- "Depois de uma busca, finalmente encontrei seu produto!"
- "Que pena, acho que não tenho nenhum produto assim!"
- "Pensei muito, e finalmente encontrei sua solução!"
- "Analisei com cuidado e tenho a resposta perfeita para você!"

IMPORTANTE: Nunca deixe a primeira frase da sua resposta finalizar com dois pontos (:).

Após esta frase inicial, continue com sua resposta normalmente.`;
}

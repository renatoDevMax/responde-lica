/**
 * Serviços de busca relacionados aos produtos Lica
 */

import { gerarEmbedding } from "./gerarEmbedding";
import { findSimilarEmbeddings } from "./pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Produto } from "../models/Produto";
import connectDB from "../lib/mongodb";
import { openai } from "../lib/openai-config";

export interface ProdutoFinal {
  // Dados do MongoDB
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  imagem: string;
  destaque: boolean;
  cod: string;
  ativado: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Dados do Pinecone
  similaridade: number | undefined;
  comoUsar: string;
  descricaoPinecone: string;
}

interface Mensagem {
  role: "user" | "assistant";
  content: string;
}

async function otimizarMensagemParaBusca(
  mensagem: string,
  contexto: { mensagens: Mensagem[] }
): Promise<string> {
  try {
    // Pega as últimas 4 mensagens para contexto (2 pares de pergunta/resposta)
    const mensagensRecentes = contexto.mensagens.slice(-4);
    const contextoFormatado = mensagensRecentes
      .map(
        (msg) =>
          `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}`
      )
      .join("\n");

    const prompt = `Você é um especialista em produtos de limpeza. Sua tarefa é otimizar a mensagem do usuário para melhorar a busca de produtos no banco de dados.

CONTEXTO DA CONVERSA:
${contextoFormatado}

MENSAGEM ATUAL DO USUÁRIO:
"${mensagem}"

INSTRUÇÕES:
1. Analise o contexto da conversa para entender:
   - O tipo de produto que o usuário está procurando
   - O problema específico que precisa ser resolvido
   - A intensidade do tratamento necessário (se aplicável)
   - O estágio do tratamento (se aplicável)

2. Se a mensagem atual for uma pergunta sobre disponibilidade/compra (ex: "você tem?", "tem algum?", "vende?"), mantenha o foco no último tipo de produto discutido

3. Expanda a mensagem incluindo:
   - Termos relacionados ao tipo específico de produto identificado no contexto
   - Características específicas do problema que precisa ser resolvido
   - Intensidade do tratamento necessário (quando aplicável)
   - Estágio do tratamento (quando aplicável)

4. Use termos técnicos do setor de limpeza quando apropriado

5. Mantenha a mensagem concisa e direta

Exemplos de otimização com contexto:

Exemplo 1 - Produto de Piscina:
Contexto:
Usuário: "minha água está com um aspecto verde, retirei todas as folhas, preciso aplicar qual produto agora?"
Assistente: [resposta sobre algicida de choque]
Usuário: "você tem algum deles para vender?"
Mensagem otimizada: "Algicida de choque para tratamento de água verde em piscinas, produto forte para eliminação de algas, tratamento inicial de choque"

Exemplo 2 - Produto de Limpeza Geral:
Contexto:
Usuário: "preciso limpar o banco do carro que está com manchas"
Assistente: [resposta sobre limpador específico para estofados]
Usuário: "você tem algum deles para vender?"
Mensagem otimizada: "Limpador específico para estofados automotivos, remove manchas e sujeiras, produto para limpeza profunda de tecidos"

Exemplo 3 - Produto de Cozinha:
Contexto:
Usuário: "tenho gordura acumulada no fogão"
Assistente: [resposta sobre desengordurante]
Usuário: "você tem algum deles para vender?"
Mensagem otimizada: "Desengordurante forte para fogão, remove gordura acumulada, produto específico para limpeza de cozinha"

Responda APENAS com a mensagem otimizada, sem explicações adicionais.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const mensagemOtimizada =
      completion.choices[0].message.content?.trim() || mensagem;
    console.log("Mensagem original:", mensagem);
    console.log("Mensagem otimizada:", mensagemOtimizada);
    return mensagemOtimizada;
  } catch (error) {
    console.error("Erro ao otimizar mensagem:", error);
    return mensagem; // Retorna a mensagem original em caso de erro
  }
}

export const buscarProdutosCompleto = async (
  texto: string,
  contexto?: { mensagens: Mensagem[] }
): Promise<ProdutoFinal[]> => {
  try {
    console.log("Iniciando busca por:", texto);

    // 0. Conectar ao MongoDB
    await connectDB();
    console.log("Conexão com MongoDB estabelecida");

    // 1. Otimizar a mensagem do usuário
    const textoOtimizado = await otimizarMensagemParaBusca(
      texto,
      contexto || { mensagens: [] }
    );
    console.log("Mensagem otimizada para busca:", textoOtimizado);

    // 2. Gerar embedding do texto otimizado
    const embedding = await gerarEmbedding(textoOtimizado);
    console.log("Embedding gerado com sucesso");

    // 3. Buscar IDs similares no Pinecone
    const produtosSimilares = await findSimilarEmbeddings(embedding);
    console.log("Produtos similares encontrados:", produtosSimilares.length);

    if (produtosSimilares.length === 0) {
      console.log("Nenhum produto similar encontrado");
      return [];
    }

    // 4. Buscar os produtos completos no Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    const produtosCompletos = await Promise.all(
      produtosSimilares.map(async (produtoSimilar) => {
        console.log("Buscando produto no Pinecone:", produtoSimilar.id);
        const fetchResponse = await index.fetch([produtoSimilar.id]);
        const produto = fetchResponse.records[produtoSimilar.id];

        if (!produto || !produto.metadata) {
          console.warn(
            `Produto não encontrado no Pinecone: ${produtoSimilar.id}`
          );
          return null;
        }

        return {
          id: produto.id,
          values: produto.values as number[],
          metadata: {
            produtoId: String(produto.metadata.produtoId),
            nome: String(produto.metadata.nome),
            descricao: String(produto.metadata.descricao),
            comoUsar: String(produto.metadata.comoUsar),
          },
        };
      })
    );

    console.log("Produtos completos do Pinecone:", produtosCompletos.length);

    // 5. Buscar os produtos no MongoDB e criar objetos finais
    const produtosFinais = await Promise.all(
      produtosCompletos
        .filter(
          (produto): produto is NonNullable<typeof produto> => produto !== null
        )
        .map(async (produtoPinecone, index) => {
          console.log(
            "Buscando produto no MongoDB:",
            produtoPinecone.metadata.produtoId
          );
          const produtoMongo = await Produto.findOne({
            cod: produtoPinecone.metadata.produtoId,
          });

          if (!produtoMongo) {
            console.warn(
              `Produto não encontrado no MongoDB: ${produtoPinecone.metadata.produtoId}`
            );
            return null;
          }

          // Criar objeto final combinando dados do MongoDB e Pinecone
          const produtoFinal: ProdutoFinal = {
            // Dados do MongoDB
            nome: produtoMongo.nome,
            preco: produtoMongo.preco,
            descricao: produtoMongo.descricao,
            categoria: produtoMongo.categoria,
            imagem: produtoMongo.imagem,
            destaque: produtoMongo.destaque,
            cod: produtoMongo.cod,
            ativado: produtoMongo.ativado,
            createdAt: produtoMongo.createdAt,
            updatedAt: produtoMongo.updatedAt,

            // Dados do Pinecone
            similaridade: produtosSimilares[index].similaridade,
            comoUsar: produtoPinecone.metadata.comoUsar,
            descricaoPinecone: produtoPinecone.metadata.descricao,
          };

          return produtoFinal;
        })
    );

    // 6. Exibir no terminal apenas os nomes dos produtos
    console.log("\nProdutos ajustados com dados do Pinecone e MongoDB:");
    produtosFinais.forEach((produtoFinal, index) => {
      if (produtoFinal) {
        console.log(`${index + 1}. ${produtoFinal.nome}`);
      }
    });
    console.log(""); // Linha em branco para melhor visualização

    // 7. Retornar apenas os produtos finais não nulos
    const produtosFiltrados = produtosFinais.filter(
      (produto): produto is ProdutoFinal => produto !== null
    );

    console.log("Total de produtos retornados:", produtosFiltrados.length);
    return produtosFiltrados;
  } catch (error) {
    console.error("Erro detalhado ao buscar produtos completos:", error);
    throw new Error("Não foi possível realizar a busca dos produtos");
  }
};

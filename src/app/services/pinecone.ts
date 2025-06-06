import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function salvarProdutoNoPinecone(produto: {
  cod: string;
  nome: string;
  descricao: string;
  comoUsar: string;
  embedding: number[];
}) {
  try {
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    await index.upsert([
      {
        id: produto.cod,
        values: produto.embedding,
        metadata: {
          produtoId: produto.cod,
          nome: produto.nome,
          descricao: produto.descricao,
          comoUsar: produto.comoUsar,
        },
      },
    ]);

    console.log(`Produto ${produto.nome} salvo com sucesso no Pinecone`);
    return true;
  } catch (error) {
    console.error("Erro ao salvar produto no Pinecone:", error);
    throw error;
  }
}

interface ProdutoSimilar {
  id: string;
  similaridade: number;
}

export async function findSimilarEmbeddings(embedding: number[]) {
  try {
    console.log(
      "Iniciando busca no Pinecone com embedding de tamanho:",
      embedding.length
    );

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    console.log("Buscando produtos similares no Pinecone...");
    const queryResponse = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    console.log(
      "Resposta do Pinecone recebida:",
      queryResponse.matches.length,
      "matches"
    );

    const matches = queryResponse.matches.map((match) => ({
      id: match.id,
      similaridade: match.score,
    }));

    console.log("Matches processados:", matches.length);
    return matches;
  } catch (error) {
    console.error("Erro detalhado ao buscar embeddings similares:", error);
    throw new Error("Não foi possível buscar produtos similares");
  }
}

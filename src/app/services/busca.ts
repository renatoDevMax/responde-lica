/**
 * Serviços de busca relacionados aos produtos Lica
 */

import { gerarEmbedding } from "./gerarEmbedding";
import { findSimilarEmbeddings } from "./pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Produto } from "../models/Produto";
import connectDB from "../lib/mongodb";

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

export const buscarProdutosCompleto = async (
  texto: string
): Promise<ProdutoFinal[]> => {
  try {
    console.log("Iniciando busca por:", texto);

    // 0. Conectar ao MongoDB
    await connectDB();
    console.log("Conexão com MongoDB estabelecida");

    // 1. Gerar embedding do texto
    const embedding = await gerarEmbedding(texto);
    console.log("Embedding gerado com sucesso");

    // 2. Buscar IDs similares no Pinecone
    const produtosSimilares = await findSimilarEmbeddings(embedding);
    console.log("Produtos similares encontrados:", produtosSimilares.length);

    if (produtosSimilares.length === 0) {
      console.log("Nenhum produto similar encontrado");
      return [];
    }

    // 3. Buscar os produtos completos no Pinecone
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

    // 4. Buscar os produtos no MongoDB e criar objetos finais
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

    // 5. Exibir no terminal apenas os nomes dos produtos
    console.log("\nProdutos ajustados com dados do Pinecone e MongoDB:");
    produtosFinais.forEach((produtoFinal, index) => {
      if (produtoFinal) {
        console.log(`${index + 1}. ${produtoFinal.nome}`);
      }
    });
    console.log(""); // Linha em branco para melhor visualização

    // 6. Retornar apenas os produtos finais não nulos
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

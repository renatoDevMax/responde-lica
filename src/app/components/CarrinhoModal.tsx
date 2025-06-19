import { ProdutoFinal } from "../services/busca";
import { X, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface CarrinhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  produtos: ProdutoFinal[];
  onRemoverProduto: (cod: string) => void;
}

interface ProdutoCarrinho extends ProdutoFinal {
  quantidade: number;
}

export default function CarrinhoModal({
  isOpen,
  onClose,
  produtos,
  onRemoverProduto,
}: CarrinhoModalProps) {
  const [produtosLocal, setProdutosLocal] = useState<ProdutoFinal[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    setProdutosLocal(produtos);
  }, [produtos]);

  if (!isOpen) return null;

  // Agrupa produtos iguais e conta quantidade
  const produtosAgrupados = produtosLocal.reduce(
    (acc: ProdutoCarrinho[], produto) => {
      const produtoExistente = acc.find((p) => p.cod === produto.cod);
      if (produtoExistente) {
        produtoExistente.quantidade += 1;
      } else {
        acc.push({ ...produto, quantidade: 1 });
      }
      return acc;
    },
    []
  );

  const total = produtosAgrupados.reduce(
    (acc, produto) => acc + produto.preco * produto.quantidade,
    0
  );

  const atualizarQuantidade = (cod: string, novaQuantidade: number) => {
    if (novaQuantidade < 1) {
      onRemoverProduto(cod);
      return;
    }

    const produtoAtual = produtosLocal.find((p) => p.cod === cod);
    if (!produtoAtual) return;

    // Remove todos os produtos com este código
    const produtosFiltrados = produtosLocal.filter((p) => p.cod !== cod);

    // Adiciona a nova quantidade de produtos
    for (let i = 0; i < novaQuantidade; i++) {
      produtosFiltrados.push(produtoAtual);
    }

    // Atualiza o array local de produtos
    setProdutosLocal(produtosFiltrados);

    // Atualiza o array original de produtos
    produtos.length = 0;
    produtos.push(...produtosFiltrados);

    // Força a atualização do componente
    setForceUpdate((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-[#183263]/40 flex items-center justify-end z-50">
      <div
        className="bg-white h-full w-full max-w-md transform transition-transform duration-300 ease-in-out"
        style={{ boxShadow: "-4px 0 10px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-[#183263]">
            Carrinho de Compras
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
          {produtosAgrupados.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Seu carrinho está vazio
            </p>
          ) : (
            <div className="space-y-4">
              {produtosAgrupados.map((produto) => (
                <div
                  key={`${produto.cod}-${forceUpdate}`}
                  className="flex flex-col p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="w-24 h-24 object-contain bg-gray-50 rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#183263] text-lg mb-1">
                        {produto.nome}
                      </h3>
                      <p className="text-[#7EC13D] font-bold text-lg">
                        R$ {produto.preco.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoverProduto(produto.cod)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">Quantidade:</span>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2">
                        <button
                          onClick={() =>
                            atualizarQuantidade(
                              produto.cod,
                              produto.quantidade - 1
                            )
                          }
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {produto.quantidade}
                        </span>
                        <button
                          onClick={() =>
                            atualizarQuantidade(
                              produto.cod,
                              produto.quantidade + 1
                            )
                          }
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Subtotal:</span>
                      <p className="text-[#183263] font-bold text-lg">
                        R$ {(produto.preco * produto.quantidade).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 p-4 border-t bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-[#183263]">Total:</span>
            <span className="text-xl font-bold text-[#7EC13D]">
              R$ {total.toFixed(2)}
            </span>
          </div>
          <button
            className="w-full bg-[#7EC13D] text-white py-3 rounded-lg hover:bg-[#6ba832] transition-colors font-medium"
            onClick={() => {
              // Monta o objeto com os produtos e suas quantidades
              const carrinhoData = {
                produtosCarrinho: produtosAgrupados.map((produto) => ({
                  cod: produto.cod,
                  quantidade: produto.quantidade,
                })),
              };

              // Codifica os dados em base64
              const encodedData = btoa(JSON.stringify(carrinhoData));

              // Redireciona para a URL com os dados codificados
              const url = `https://www.ecocleanmatinhos.com.br/receberCarrinho?data=${encodedData}`;
              window.location.href = url;
            }}
          >
            Enviar para meu carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

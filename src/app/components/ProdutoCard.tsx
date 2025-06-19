import { ProdutoFinal } from "../services/busca";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface ProdutoCardProps {
  produto: ProdutoFinal;
  onAdicionarAoCarrinho: (produto: ProdutoFinal) => void;
  quantidadeNoCarrinho?: number;
  onAtualizarQuantidade?: (cod: string, quantidade: number) => void;
}

export default function ProdutoCard({
  produto,
  onAdicionarAoCarrinho,
  quantidadeNoCarrinho = 0,
  onAtualizarQuantidade,
}: ProdutoCardProps) {
  const [quantidade, setQuantidade] = useState(quantidadeNoCarrinho);

  const handleAdicionarAoCarrinho = () => {
    onAdicionarAoCarrinho(produto);
    setQuantidade(1);
  };

  const handleAtualizarQuantidade = (novaQuantidade: number) => {
    if (novaQuantidade < 0) return;

    setQuantidade(novaQuantidade);
    if (onAtualizarQuantidade) {
      onAtualizarQuantidade(produto.cod, novaQuantidade);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64 md:w-80 lg:w-96">
      <img
        src={produto.imagem}
        alt={produto.nome}
        className="w-full h-48 object-contain bg-gray-50"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#183263] mb-2">
          {produto.nome}
        </h3>

        <div className="h-[170px] overflow-y-auto mb-4">
          <p className="text-gray-600 text-sm">{produto.descricao}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xl font-bold text-[#7EC13D]">
            R$ {produto.preco.toFixed(2)}
          </span>

          {quantidade === 0 ? (
            <button
              className="bg-[#7EC13D] text-white px-4 py-2 rounded-lg hover:bg-[#6ba832] transition-colors w-full"
              onClick={handleAdicionarAoCarrinho}
            >
              Adicionar ao Carrinho
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-600">Quantidade:</span>
              <div className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2">
                <button
                  onClick={() => handleAtualizarQuantidade(quantidade - 1)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Minus size={20} className="text-[#183263]" />
                </button>
                <span className="text-lg font-medium text-[#183263]">
                  {quantidade}
                </span>
                <button
                  onClick={() => handleAtualizarQuantidade(quantidade + 1)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Plus size={20} className="text-[#183263]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

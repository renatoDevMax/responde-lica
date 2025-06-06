"use client";

import { useState } from "react";

interface ProdutoFinal {
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
  similaridade: number;
  comoUsar: string;
  descricaoPinecone: string;
}

interface Message {
  text: string;
  isUser: boolean;
  produtos?: ProdutoFinal[];
}

export default function SimpleChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Adiciona mensagem do usuário
      setMessages((prev) => [...prev, { text: input, isUser: true }]);
      setInput("");

      // Busca produtos similares via API
      const response = await fetch("/api/busca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texto: input }),
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
      }

      const data = await response.json();

      // Adiciona resposta do bot com os produtos
      setMessages((prev) => [
        ...prev,
        {
          text: "Encontrei os seguintes produtos similares:",
          isUser: false,
          produtos: data.produtos,
        },
      ]);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Desculpe, ocorreu um erro ao buscar os produtos.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-[#183263] p-4">
        <h2 className="text-white text-xl font-semibold">Chat de Produtos</h2>
      </div>

      <div className="h-[600px] overflow-y-auto p-4 bg-[#EDF3F9]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.isUser ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.isUser
                  ? "bg-[#7EC13D] text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.text}
            </div>
            {message.produtos && (
              <div className="mt-4 space-y-4">
                {message.produtos.map((produto, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-[#183263]">{produto.nome}</h3>
                    <p className="text-gray-600 mt-2">{produto.descricao}</p>
                    <div className="mt-2">
                      <h4 className="font-semibold text-[#7EC13D]">
                        Como usar:
                      </h4>
                      <p className="text-gray-600">{produto.comoUsar}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Preço: R$ {produto.preco.toFixed(2)}</p>
                      <p>Categoria: {produto.categoria}</p>
                      <p>Similaridade: {produto.similaridade.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-white text-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#7EC13D] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#7EC13D] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#7EC13D] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre produtos..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7EC13D]"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-[#7EC13D] text-white px-4 py-2 rounded-lg transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#6ba832]"
            }`}
            disabled={isLoading}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

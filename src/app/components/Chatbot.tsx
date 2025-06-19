"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ShoppingCart } from "lucide-react";
import ProdutoCard from "./ProdutoCard";
import MessageContent from "./MessageContent";
import FadeMessage from "./FadeMessage";
import CarrinhoModal from "./CarrinhoModal";
import { ProdutoFinal } from "../services/busca";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
  produto?: ProdutoFinal;
  timestamp?: number;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá, sou a Lica, sua Assistente de Limpeza personalizada, como posso ajudar hoje?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState<ProdutoFinal | null>(null);
  const [produtosExibidos, setProdutosExibidos] = useState<Set<string>>(
    new Set()
  );
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [produtosCarrinho, setProdutosCarrinho] = useState<ProdutoFinal[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToNewMessage = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        // Calcula a posição relativa ao container
        const messageRect = messagesEndRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = messageRect.top - containerRect.top;

        // Ajusta o scroll para mostrar a mensagem no topo do container
        container.scrollTop = container.scrollTop + relativeTop;
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      // Pequeno delay para garantir que o DOM esteja atualizado
      setTimeout(scrollToNewMessage, 100);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Adiciona a mensagem do usuário
      const userMessage: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Rola para o final após adicionar a mensagem do usuário
      setTimeout(scrollToBottom, 100);

      // Gera resposta usando a API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          produtoAtual: produtoAtual,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar mensagem");
      }

      // Verifica se o produto já foi exibido
      const produtoJaExibido =
        data.objetoProdutoFinal &&
        produtosExibidos.has(data.objetoProdutoFinal.cod);

      // Adiciona a resposta do assistente
      const assistantMessage: Message = {
        role: "assistant",
        content: data.mensagem,
        produto: produtoJaExibido ? undefined : data.objetoProdutoFinal,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Atualiza o produto atual e a lista de produtos exibidos
      if (data.objetoProdutoFinal) {
        setProdutoAtual(data.objetoProdutoFinal);
        if (!produtoJaExibido) {
          setProdutosExibidos(
            (prev) => new Set([...prev, data.objetoProdutoFinal.cod])
          );
        }
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLicaImage = (message: Message) => {
    if (!message.timestamp) return "/licaPensando.png";

    const now = Date.now();
    const messageAge = now - message.timestamp;

    if (messageAge < 10000) {
      // 10 segundos
      return "/licaRespondendo.png";
    }

    return "/licaFeliz.png";
  };

  const adicionarAoCarrinho = (produto: ProdutoFinal) => {
    setProdutosCarrinho((prev) => [...prev, produto]);
  };

  const removerDoCarrinho = (cod: string) => {
    setProdutosCarrinho((prev) => prev.filter((p) => p.cod !== cod));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden relative">
      <button
        onClick={() => setCarrinhoAberto(true)}
        className="fixed top-4 right-4 w-12 h-12 bg-[#183263] text-white rounded-full flex items-center justify-center hover:bg-[#7EC13D] transition-colors shadow-lg z-50"
      >
        <ShoppingCart size={24} />
        {produtosCarrinho.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#7EC13D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {produtosCarrinho.length}
          </span>
        )}
      </button>

      <div className="bg-[#183263] p-4 relative">
        <div className="absolute right-[10px] top-[10px] h-12 bg-[url('/logotransp.png')] w-[100px] bg-contain bg-no-repeat"></div>
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Lica Responde:</h2>
        </div>
      </div>

      <div className="h-[500px] overflow-y-auto p-4 bg-[#EDF3F9]">
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? messagesEndRef : null}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            {message.role === "user" ? (
              <div className="inline-block p-3 rounded-lg bg-[#7EC13D] text-white">
                {message.content}
              </div>
            ) : (
              <FadeMessage>
                <div className="inline-block p-3 rounded-lg bg-white text-gray-800">
                  <div className="flex flex-col">
                    <div className="flex items-start gap-3">
                      <div className="w-24 h-24 relative flex-shrink-0">
                        <Image
                          src={getLicaImage(message)}
                          alt="Lica"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <MessageContent
                          content={message.content}
                          firstSentenceOnly
                        />
                      </div>
                    </div>
                    <div className="mt-3 pl-0">
                      <MessageContent
                        content={message.content}
                        skipFirstSentence
                      />
                    </div>
                  </div>
                  {message.produto && (
                    <div className="mt-4">
                      <ProdutoCard
                        produto={message.produto}
                        onAdicionarAoCarrinho={adicionarAoCarrinho}
                        quantidadeNoCarrinho={
                          produtosCarrinho.filter(
                            (p) => p.cod === message.produto?.cod
                          ).length
                        }
                        onAtualizarQuantidade={(cod, quantidade) => {
                          // Remove todos os produtos com este código
                          const produtosFiltrados = produtosCarrinho.filter(
                            (p) => p.cod !== cod
                          );

                          // Adiciona a nova quantidade
                          const produto = message.produto;
                          if (produto) {
                            for (let i = 0; i < quantidade; i++) {
                              produtosFiltrados.push(produto);
                            }
                          }

                          // Atualiza o carrinho
                          setProdutosCarrinho(produtosFiltrados);
                        }}
                      />
                    </div>
                  )}
                </div>
              </FadeMessage>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-white text-gray-800">
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 relative flex-shrink-0">
                  <Image
                    src="/licaPensando.png"
                    alt="Lica pensando"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-gray-700">
                    Estou pensando em alguma solução pra você, dexe-me ver por
                    aqui
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#7EC13D] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#7EC13D] rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-[#7EC13D] rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre produtos de limpeza..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7EC13D] text-gray-900 placeholder-gray-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
            disabled={isLoading}
            rows={1}
            style={{
              height: "auto",
              minHeight: "40px",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              // Verifica se é um dispositivo móvel
              const isMobile =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                );

              // Se não for mobile e pressionar Enter sem Shift
              if (!isMobile && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Previne a quebra de linha
                if (!isLoading && input.trim()) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
          />
          <button
            type="submit"
            className={`bg-[#7EC13D] text-white p-2 rounded-lg transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#6ba832]"
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      <CarrinhoModal
        isOpen={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        produtos={produtosCarrinho}
        onRemoverProduto={removerDoCarrinho}
      />
    </div>
  );
}

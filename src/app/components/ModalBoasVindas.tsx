"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ModalBoasVindasProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalBoasVindas({
  isOpen,
  onClose,
}: ModalBoasVindasProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Aguarda a animação terminar antes de fechar
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-4 ${
        isClosing ? "bg-opacity-0" : "bg-opacity-50"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-[500px] overflow-y-auto transition-all duration-300 transform ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Botão de fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Conteúdo do modal */}
        <div className="text-center">
          {/* Imagem da Lica */}
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <Image
              src="/licaFeliz.png"
              alt="Lica - Assistente de Limpeza"
              fill
              className="object-contain"
            />
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-[#183263] mb-4">
            Olá! Eu sou a Lica! 👋
          </h2>

          {/* Mensagem */}
          <div className="text-gray-700 text-sm leading-relaxed space-y-3">
            <p>
              Sou uma senhorinha que, com meus anos de experiência, adquiri
              muita sabedoria sobre produtos de limpeza. Estou aqui para ajudar
              você a encontrar os produtos que melhor atendem suas necessidades!
            </p>

            <p>
              Posso sugerir produtos, explicar como usá-los e até mesmo criar
              uma lista personalizada para você. Minha especialidade é produtos
              de limpeza doméstica e comercial.
            </p>

            <p className="text-[#7EC13D] font-medium">
              💡 Dica importante: Embora eu seja experiente, sempre recomendo
              verificar o rótulo do produto ou conversar com nossos atendentes
              para ter certeza da eficácia de qualquer indicação!
            </p>

            <p className="bg-blue-50 p-3 rounded-lg border-l-4 border-[#183263]">
              <span className="font-medium text-[#183263]">
                💬 Para respostas mais precisas:
              </span>
              <br />
              Seja específico sobre sua necessidade! Por exemplo, em vez de
              "preciso limpar", diga "preciso limpar manchas de gordura no fogão
              da cozinha". Quanto mais detalhes você fornecer - como o tipo de
              superfície, o problema específico e o que você espera do produto -
              melhor posso ajudá-lo a encontrar a solução ideal!
            </p>

            <p className="text-sm text-gray-600 italic">
              Sou uma inteligência artificial especializada em produtos de
              limpeza, criada para tornar sua experiência de compra mais fácil e
              informada.
            </p>
          </div>

          {/* Botão de continuar */}
          <button
            onClick={handleClose}
            className="mt-6 bg-[#7EC13D] text-white px-6 py-3 rounded-lg hover:bg-[#6ba832] transition-colors font-medium"
          >
            Entendi! Vamos conversar! 😊
          </button>
        </div>
      </div>
    </div>
  );
}

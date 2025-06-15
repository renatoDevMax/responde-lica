"use client";

import React, { useState, useEffect } from "react";
import { gerarEmbedding } from "../../services/gerarEmbedding";

interface EmbeddingFormProps {
  onConfirm: (texto: string) => void;
  onCancel: () => void;
  initialValue: string;
  onEmbeddingGenerated: (embedding: number[]) => void;
}

const EmbeddingForm: React.FC<EmbeddingFormProps> = ({
  onConfirm,
  onCancel,
  initialValue,
  onEmbeddingGenerated,
}) => {
  const [texto, setTexto] = useState(initialValue);
  const [embedding, setEmbedding] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTexto(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim()) {
      onConfirm(texto.trim());
    }
  };

  const handleGerarEmbedding = async () => {
    if (!texto.trim()) {
      setError("Por favor, insira um texto para gerar o embedding");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resultado = await gerarEmbedding(texto.trim());
      setEmbedding(resultado);
      onEmbeddingGenerated(resultado);
    } catch (err) {
      setError("Erro ao gerar embedding. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="texto"
            className="block text-sm font-medium text-[#183263] mb-2"
          >
            Texto para Embedding
          </label>
          <textarea
            id="texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#7EC13D] focus:border-[#7EC13D] outline-none min-h-[200px] resize-y"
            placeholder="Digite o texto que será usado para gerar o embedding do produto. Este texto deve conter informações relevantes sobre o produto que ajudarão na busca semântica."
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGerarEmbedding}
            disabled={isLoading}
            className={`px-6 py-3 bg-[#183263] text-white rounded-md hover:bg-[#1f3d7a] transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Gerando..." : "Gerar Embedding"}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-center text-sm">{error}</div>
        )}

        <div className="h-[100px] border border-gray-300 rounded-md p-4 bg-[#EDF3F9] overflow-auto">
          {embedding.length > 0 ? (
            <pre className="text-sm text-[#183263] whitespace-pre-wrap break-all">
              {JSON.stringify(embedding, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-center mt-[130px]">
              O embedding será exibido aqui após a geração
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[#183263] border border-[#183263] rounded-md hover:bg-[#EDF3F9] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#7EC13D] text-white rounded-md hover:bg-[#6ba832] transition-colors"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmbeddingForm;

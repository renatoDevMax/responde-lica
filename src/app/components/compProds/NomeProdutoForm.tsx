"use client";

import React, { useState, useEffect } from "react";

interface NomeProdutoFormProps {
  onConfirm: (dados: { id: string; nome: string }) => void;
  onCancel: () => void;
  initialValue: { id: string; nome: string };
}

const NomeProdutoForm: React.FC<NomeProdutoFormProps> = ({
  onConfirm,
  onCancel,
  initialValue,
}) => {
  const [id, setId] = useState(initialValue.id);
  const [nome, setNome] = useState(initialValue.nome);

  useEffect(() => {
    setId(initialValue.id);
    setNome(initialValue.nome);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim() && nome.trim()) {
      onConfirm({ id: id.trim(), nome: nome.trim() });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="id"
            className="block text-sm font-medium text-[#183263] mb-2"
          >
            Código do Produto
          </label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#7EC13D] focus:border-[#7EC13D] outline-none"
            placeholder="Digite o código do produto"
            required
          />
        </div>

        <div>
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-[#183263] mb-2"
          >
            Nome do Produto
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#7EC13D] focus:border-[#7EC13D] outline-none"
            placeholder="Digite o nome do produto"
            required
          />
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

export default NomeProdutoForm;

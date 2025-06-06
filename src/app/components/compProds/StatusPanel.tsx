"use client";

import React from "react";

interface StatusPanelProps {
  status: {
    nome: boolean;
    descricao: boolean;
    comoUsar: boolean;
    embedding: boolean;
  };
  onSave: () => void;
  isSaving: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  status,
  onSave,
  isSaving,
}) => {
  const totalSteps = Object.keys(status).length;
  const completedSteps = Object.values(status).filter(Boolean).length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="w-64 bg-white shadow-lg p-6">
      <h2 className="text-lg font-semibold text-[#183263] mb-4">
        Progresso do Cadastro
      </h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-4 h-4 rounded-full ${
              status.nome ? "bg-[#7EC13D]" : "bg-gray-200"
            }`}
          />
          <span className="text-sm text-gray-700">Nome do Produto</span>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-4 h-4 rounded-full ${
              status.descricao ? "bg-[#7EC13D]" : "bg-gray-200"
            }`}
          />
          <span className="text-sm text-gray-700">Descrição</span>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-4 h-4 rounded-full ${
              status.comoUsar ? "bg-[#7EC13D]" : "bg-gray-200"
            }`}
          />
          <span className="text-sm text-gray-700">Como Usar</span>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-4 h-4 rounded-full ${
              status.embedding ? "bg-[#7EC13D]" : "bg-gray-200"
            }`}
          />
          <span className="text-sm text-gray-700">Embedding</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-[#7EC13D] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completedSteps} de {totalSteps} etapas concluídas
        </p>
      </div>

      <button
        onClick={onSave}
        disabled={completedSteps !== totalSteps || isSaving}
        className={`w-full mt-6 px-4 py-2 rounded-md text-white transition-colors ${
          completedSteps === totalSteps && !isSaving
            ? "bg-[#7EC13D] hover:bg-[#6ba832]"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {isSaving ? "Salvando..." : "Salvar Produto"}
      </button>
    </div>
  );
};

export default StatusPanel;

"use client";

import React, { useState, useEffect } from "react";

interface ComoUsarFormProps {
  onConfirm: (instrucoes: string) => void;
  onCancel: () => void;
  initialValue: string;
}

const ComoUsarForm: React.FC<ComoUsarFormProps> = ({
  onConfirm,
  onCancel,
  initialValue,
}) => {
  const [instrucoes, setInstrucoes] = useState(initialValue);

  useEffect(() => {
    setInstrucoes(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instrucoes.trim()) {
      onConfirm(instrucoes.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="instrucoes"
            className="block text-sm font-medium text-[#183263] mb-2"
          >
            Instruções de Uso
          </label>
          <textarea
            id="instrucoes"
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#7EC13D] focus:border-[#7EC13D] outline-none min-h-[200px] resize-y"
            placeholder="Digite as instruções detalhadas de como usar o produto, incluindo diluição, aplicação, tempo de ação e cuidados necessários"
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

export default ComoUsarForm;

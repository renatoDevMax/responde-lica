"use client";

import React from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const sections = [
    { id: "nome", label: "Nome do Produto" },
    { id: "descricao", label: "Descrição" },
    { id: "como-usar", label: "Como Usar" },
    { id: "embedding", label: "Embedding" },
  ];

  return (
    <div className="w-64 bg-[#183263] min-h-screen p-6">
      <h1 className="text-xl font-bold text-white mb-8">Cadastro de Produto</h1>

      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
              activeSection === section.id
                ? "bg-[#7EC13D] text-white"
                : "text-[#EDF3F9] hover:bg-[#1f3d7a]"
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

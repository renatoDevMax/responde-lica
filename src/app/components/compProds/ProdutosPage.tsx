"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import StatusPanel from "./StatusPanel";
import NomeProdutoForm from "./NomeProdutoForm";
import DescricaoProdutoForm from "./DescricaoProdutoForm";
import ComoUsarForm from "./ComoUsarForm";
import EmbeddingForm from "./EmbeddingForm";

interface ProdutoData {
  id: string;
  nome: string;
}

interface Produto {
  cod: string;
  nome: string;
  descricao: string;
  comoUsar: string;
  embedding: number[];
}

const ProdutosPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("nome");
  const [status, setStatus] = useState({
    nome: false,
    descricao: false,
    comoUsar: false,
    embedding: false,
  });
  const [produtoData, setProdutoData] = useState<ProdutoData>({
    id: "",
    nome: "",
  });
  const [descricaoProduto, setDescricaoProduto] = useState("");
  const [comoUsarProduto, setComoUsarProduto] = useState("");
  const [embeddingProduto, setEmbeddingProduto] = useState("");
  const [embeddingGerado, setEmbeddingGerado] = useState<number[]>([]);
  const [produtoSalvo, setProdutoSalvo] = useState<Produto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const resetarFormulario = () => {
    setActiveSection("nome");
    setStatus({
      nome: false,
      descricao: false,
      comoUsar: false,
      embedding: false,
    });
    setProdutoData({
      id: "",
      nome: "",
    });
    setDescricaoProduto("");
    setComoUsarProduto("");
    setEmbeddingProduto("");
    setEmbeddingGerado([]);
    setProdutoSalvo(null);
    setSaveError(null);
  };

  const navegarParaProximaSecao = (secaoAtual: string) => {
    const secoes = ["nome", "descricao", "como-usar", "embedding"];
    const indexAtual = secoes.indexOf(secaoAtual);
    if (indexAtual < secoes.length - 1) {
      setActiveSection(secoes[indexAtual + 1]);
    }
  };

  const handleConfirmNome = (dados: ProdutoData) => {
    setProdutoData(dados);
    setStatus((prev) => ({ ...prev, nome: true }));
    navegarParaProximaSecao("nome");
  };

  const handleCancelNome = () => {
    setProdutoData({ id: "", nome: "" });
    setStatus((prev) => ({ ...prev, nome: false }));
  };

  const handleConfirmDescricao = (descricao: string) => {
    setDescricaoProduto(descricao);
    setStatus((prev) => ({ ...prev, descricao: true }));
    navegarParaProximaSecao("descricao");
  };

  const handleCancelDescricao = () => {
    setDescricaoProduto("");
    setStatus((prev) => ({ ...prev, descricao: false }));
  };

  const handleConfirmComoUsar = (instrucoes: string) => {
    setComoUsarProduto(instrucoes);
    setStatus((prev) => ({ ...prev, comoUsar: true }));
    navegarParaProximaSecao("como-usar");
  };

  const handleCancelComoUsar = () => {
    setComoUsarProduto("");
    setStatus((prev) => ({ ...prev, comoUsar: false }));
  };

  const handleConfirmEmbedding = (texto: string) => {
    setEmbeddingProduto(texto);
    setStatus((prev) => ({ ...prev, embedding: true }));
    navegarParaProximaSecao("embedding");
  };

  const handleCancelEmbedding = () => {
    setEmbeddingProduto("");
    setStatus((prev) => ({ ...prev, embedding: false }));
  };

  const handleSaveProduto = async () => {
    const produto: Produto = {
      cod: produtoData.id,
      nome: produtoData.nome,
      descricao: descricaoProduto,
      comoUsar: comoUsarProduto,
      embedding: embeddingGerado,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/salvar-produto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produto),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar produto");
      }

      setProdutoSalvo(produto);
      console.log("Produto salvo com sucesso:", produto);

      // Aguarda 2 segundos para mostrar o produto salvo antes de resetar
      setTimeout(() => {
        resetarFormulario();
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      setSaveError("Erro ao salvar produto. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "nome":
        return (
          <div className="mt-8">
            <NomeProdutoForm
              onConfirm={handleConfirmNome}
              onCancel={handleCancelNome}
              initialValue={produtoData}
            />
          </div>
        );
      case "descricao":
        return (
          <div className="mt-8">
            <DescricaoProdutoForm
              onConfirm={handleConfirmDescricao}
              onCancel={handleCancelDescricao}
              initialValue={descricaoProduto}
            />
          </div>
        );
      case "como-usar":
        return (
          <div className="mt-8">
            <ComoUsarForm
              onConfirm={handleConfirmComoUsar}
              onCancel={handleCancelComoUsar}
              initialValue={comoUsarProduto}
            />
          </div>
        );
      case "embedding":
        return (
          <div className="mt-8">
            <EmbeddingForm
              onConfirm={handleConfirmEmbedding}
              onCancel={handleCancelEmbedding}
              initialValue={embeddingProduto}
              onEmbeddingGenerated={setEmbeddingGerado}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-[#183263] mb-6">
          {activeSection === "nome" && "Nome do Produto"}
          {activeSection === "descricao" && "Descrição do Produto"}
          {activeSection === "como-usar" && "Como Usar"}
          {activeSection === "embedding" && "Texto Embedding"}
        </h1>
        {renderContent()}
        {saveError && (
          <div className="mt-4 text-red-500 text-center">{saveError}</div>
        )}
        {produtoSalvo && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#183263] mb-4">
              Produto Salvo com Sucesso!
            </h2>
            <pre className="bg-[#EDF3F9] p-4 rounded-md overflow-auto max-h-[400px] text-sm">
              {JSON.stringify(produtoSalvo, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <StatusPanel
        status={status}
        onSave={handleSaveProduto}
        isSaving={isSaving}
      />
    </div>
  );
};

export default ProdutosPage;

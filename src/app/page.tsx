"use client";

import { useState, useEffect } from "react";
import Chatbot from "./components/Chatbot";
import QuadradosFundo from "./components/QuadradosFundo";
import ModalBoasVindas from "./components/ModalBoasVindas";

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mostra o modal quando a página carrega
    setShowModal(true);
  }, []);

  return (
    <div className="flex overflow-hidden items-center justify-center min-h-screen bg-gradient-to-br from-[#183263] via-[#295e94] to-[#7EC13D] p-4">
      <QuadradosFundo />
      <Chatbot />

      {/* Modal de Boas-vindas */}
      <ModalBoasVindas isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Quadrado {
  id: number;
  size: number;
  left: number;
  duration: number;
  timing: string;
  delay: number;
}

export default function QuadradosFundo() {
  const [quadrados, setQuadrados] = useState<Quadrado[]>([]);

  const gerarCubicBezier = () => {
    // Gera valores aleatórios entre 0 e 1 para os pontos de controle
    const p1 = (Math.random() * 0.5).toFixed(2);
    const p2 = (Math.random() * 0.5).toFixed(2);
    const p3 = (0.5 + Math.random() * 0.5).toFixed(2);
    const p4 = (0.5 + Math.random() * 0.5).toFixed(2);

    return `cubic-bezier(${p1}, ${p2}, ${p3}, ${p4})`;
  };

  const gerarQuadrados = () => {
    const novosQuadrados: Quadrado[] = [];

    for (let i = 0; i < 10; i++) {
      const size = Math.floor(Math.random() * (120 - 50 + 1)) + 50; // Entre 50px e 120px
      const left = Math.floor(Math.random() * (90 - 1 + 1)) + 5; // Entre 5% e 90%
      const duration = Math.floor(Math.random() * (12 - 6 + 1)) + 6; // Entre 6 e 12 segundos
      const timing = gerarCubicBezier();
      const delay = Math.floor(Math.random() * 4); // Entre 0 e 4 segundos

      novosQuadrados.push({
        id: i,
        size,
        left,
        duration,
        timing,
        delay,
      });
    }

    setQuadrados(novosQuadrados);
  };

  useEffect(() => {
    gerarQuadrados();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {quadrados.map((quadrado) => (
        <div
          key={quadrado.id}
          className="quadFundo absolute bg-white/10 backdrop-blur-sm rounded-lg animate-[animaQuad_6s_cubic-bezier(0.4,0,0.2,1)_infinite_alternate]"
          style={{
            width: `${quadrado.size}px`,
            height: `${quadrado.size}px`,
            left: `${quadrado.left}%`,
            bottom: "-120px",
            animationDuration: `${quadrado.duration}s`,
            animationTimingFunction: quadrado.timing,
            animationDelay: `${quadrado.delay}s`,
            animationDirection: "alternate",
          }}
        />
      ))}
    </div>
  );
}

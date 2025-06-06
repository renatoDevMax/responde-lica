import { useEffect, useState } from "react";

interface FadeMessageProps {
  children: React.ReactNode;
}

export default function FadeMessage({ children }: FadeMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-opacity duration-[5000ms] ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

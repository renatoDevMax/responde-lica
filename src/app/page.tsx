import connectDB from "./lib/mongodb";
import Chatbot from "./components/Chatbot";
import QuadradosFundo from "./components/QuadradosFundo";

// Inicializa a conexão com o MongoDB
connectDB().catch(console.error);

export default function Home() {
  return (
    <div className="flex overflow-hidden items-center justify-center min-h-screen bg-gradient-to-br from-[#183263] via-[#295e94] to-[#7EC13D] p-4">
      <QuadradosFundo />
      <Chatbot />
    </div>
  );
}

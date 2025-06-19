export async function gerarEmbedding(text: string) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://responde-lica.vercel.app/";
    const response = await fetch(
      `https://responde-lica.vercel.app/api/gerar-embedding`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao gerar embedding");
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Erro ao gerar embedding:", error);
    throw error;
  }
}

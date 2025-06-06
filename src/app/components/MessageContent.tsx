import ReactMarkdown from "react-markdown";

interface MessageContentProps {
  content: string;
  firstSentenceOnly?: boolean;
  skipFirstSentence?: boolean;
}

const formatContent = (content: string) => {
  // Converte números seguidos de ponto em início de linha para formato de lista markdown
  return content
    .split("\n")
    .map((line) => {
      // Verifica se a linha começa com um número seguido de ponto
      const match = line.match(/^(\d+)\.\s/);
      if (match) {
        // Adiciona um espaço extra após o número para melhor formatação
        return line.replace(/^(\d+)\.\s/, "$1. ");
      }
      return line;
    })
    .join("\n");
};

export default function MessageContent({
  content,
  firstSentenceOnly,
  skipFirstSentence,
}: MessageContentProps) {
  // Divide o conteúdo em primeira frase e resto, considerando ponto de exclamação
  const [firstSentence, ...restContent] = content.split(/(?<=[!])\s+/);
  const restText = restContent.join(" ");
  const formattedContent = formatContent(content);
  const formattedFirstSentence = formatContent(firstSentence);
  const formattedRestText = formatContent(restText);

  // Se firstSentenceOnly for true, retorna apenas a primeira frase
  if (firstSentenceOnly) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-xl font-bold text-[#183263] mb-2"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-lg font-bold text-[#183263] mb-2"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-base font-bold text-[#183263] mb-2"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-4 text-gray-700" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 mb-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className="list-decimal pl-6 mb-4 space-y-3 marker:text-[#183263] marker:font-medium [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:-ml-6 [&>li]:before:pr-2"
                {...props}
              />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-3 text-gray-700 pl-2 relative" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-[#183263]" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-gray-700" {...props} />
            ),
          }}
        >
          {formattedFirstSentence}
        </ReactMarkdown>
      </div>
    );
  }

  // Se skipFirstSentence for true, retorna apenas o resto do texto
  if (skipFirstSentence) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-xl font-bold text-[#183263] mb-2"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-lg font-bold text-[#183263] mb-2"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-base font-bold text-[#183263] mb-2"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-4 text-gray-700" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-6 mb-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className="list-decimal pl-6 mb-4 space-y-3 marker:text-[#183263] marker:font-medium [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:-ml-6 [&>li]:before:pr-2"
                {...props}
              />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-3 text-gray-700 pl-2 relative" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-[#183263]" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-gray-700" {...props} />
            ),
          }}
        >
          {formattedRestText}
        </ReactMarkdown>
      </div>
    );
  }

  // Se nenhuma prop for fornecida, retorna o texto completo
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold text-[#183263] mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold text-[#183263] mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-base font-bold text-[#183263] mb-2"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-700" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-6 mb-4 space-y-3 marker:text-[#183263] marker:font-medium [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:-ml-6 [&>li]:before:pr-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-3 text-gray-700 pl-2 relative" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-[#183263]" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700" {...props} />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}

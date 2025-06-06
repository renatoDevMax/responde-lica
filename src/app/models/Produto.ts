import mongoose from "mongoose";

interface IProduto {
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  imagem: string;
  destaque: boolean;
  cod: string;
  ativado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const produtoSchema = new mongoose.Schema<IProduto>(
  {
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    descricao: { type: String, default: "" },
    categoria: { type: String, default: "" },
    imagem: { type: String, required: true },
    destaque: { type: Boolean, default: false },
    cod: { type: String, required: true, unique: true },
    ativado: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  }
);

// Criando o modelo apenas se ele ainda não existir
export const Produto =
  mongoose.models.Produto || mongoose.model<IProduto>("Produto", produtoSchema);

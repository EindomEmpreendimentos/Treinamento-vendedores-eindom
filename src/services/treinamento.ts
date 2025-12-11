import { api } from "./auth";

export type ModuloPayload = {
  titulo: string;
  descricao?: string;
  conteudos: { video_url?: string | null; pdf_url?: string | null };
  regras?: { exigir_consumo_antes_quiz?: boolean };
  quiz: { perguntas: { titulo: string; respostas: { texto: string; correta: boolean }[] }[] };
};

export type ModuloDetalhe = {
  id: number;
  titulo: string;
  descricao?: string;
  ativo?: boolean;
  exigir_consumo_antes_quiz?: boolean;
  conteudos?: { id: number; tipo: "VIDEO" | "PDF"; url: string; titulo: string | null }[];
  perguntas?: {
    id: number;
    titulo: string;
    respostas: { id: number; texto: string; correta: boolean }[];
  }[];
  criado_em?: string;
  atualizado_em?: string;
};


/** 🔍 Detalhe do módulo (shape alinhado com nosso serializer do back) */
export type ModuloConteudoDTO = {
  id: number;
  tipo: "VIDEO" | "PDF";
  titulo: string;
  url: string;
  ordem: number;
};

export type ModuloPerguntaDTO = {
  id: number;
  titulo: string;
  ordem: number;
  respostas: { id: number; texto: string }[];
};

export type ModuloDetalheDTO = {
  id: number;
  titulo: string;
  descricao: string;
  exigir_consumo_antes_quiz: boolean;
  conteudos: ModuloConteudoDTO[];
  perguntas: ModuloPerguntaDTO[];
};

export type ModuloUpdatePayload = Partial<{
  titulo: string;
  descricao: string;
  ativo: boolean;
  exigir_consumo_antes_quiz: boolean;
}>;

export async function listarModulos() {
  const { data } = await api.get("/treinamento/modulos/");
  return data;
}

export async function criarModulo(payload: ModuloPayload) {
  const { data } = await api.post("/treinamento/modulos/criar/", payload);
  return data;
}

export async function detalheModulo(moduloId: number): Promise<ModuloDetalhe> {
  const { data } = await api.get(`/treinamento/modulos/${moduloId}/`);
  return data;
}

export async function atualizarModulo(recursoId: number, payload: ModuloUpdatePayload) {
  const { data } = await api.patch(`/treinamento/modulos/${recursoId}/atualizar/`, payload);
  return data;
}

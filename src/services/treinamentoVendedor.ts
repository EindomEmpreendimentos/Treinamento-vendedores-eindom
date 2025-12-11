import { api } from "./auth";

/** 🔁 meus módulos (vendedor) – já combinamos isso */
export type MeusModulosItem = {
  id: number;
  titulo: string;
  descricao: string;
  exigir_consumo_antes_quiz: boolean;
  concluido: boolean;
  progresso_percent: number;
  video_ok: boolean;
  pdf_ok: boolean;
  quiz_ok: boolean;
  score_quiz?: number | null;
};

export async function meusModulos(): Promise<MeusModulosItem[]> {
  const { data } = await api.get("/treinamento/me/modulos/");
  return data;
}

/** ✅ vendedor: marcar conteúdo como consumido */
export async function consumirConteudo(moduloId: number, conteudoId: number) {
  const { data } = await api.post(
    `/treinamento/modulos/${moduloId}/conteudos/${conteudoId}/consumir/`,
    {}
  );
  return data;
}

/** ✅ vendedor: responder quiz */
export type ResponderQuizPayload = {
  respostas: { pergunta_id: number; resposta_id: number }[];
};

export type ResponderQuizResponse = {
  score: number;
  total: number;
  aprovado: boolean;
};

export async function responderQuiz(
  moduloId: number,
  payload: ResponderQuizPayload
): Promise<ResponderQuizResponse> {
  const { data } = await api.post(
    `/treinamento/modulos/${moduloId}/quiz/responder/`,
    payload
  );
  return data;
}

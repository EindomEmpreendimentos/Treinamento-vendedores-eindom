import { api } from "./auth";

export type UsuarioProgressoAPI = {
  id: number;
  nome: string;
  concluido: boolean;
  progresso_percent: number;
  video_ok: boolean;
  pdf_ok: boolean;
  quiz_ok: boolean;
  score_quiz?: number | null;
  ultima_atividade: string;
};

export type ModuloMetricasAPI = {
  modulo_id: number;
  titulo: string;
  total_usuarios: number;
  concluidos: number;
  media_score_quiz: number;
  usuarios: UsuarioProgressoAPI[];
};

export async function metricasModulo(moduloId: number): Promise<ModuloMetricasAPI> {
  const { data } = await api.get(`/treinamento/modulos/${moduloId}/metricas/`);
  return data;
}
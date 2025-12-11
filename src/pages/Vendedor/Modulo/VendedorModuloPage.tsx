import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import Toast from "../../../utils/Toast";
import {
  meusModulos,
  consumirConteudo,
  responderQuiz,
} from "../../../services/treinamentoVendedor";

import { type ModuloDetalheDTO } from "../../../services/treinamento";
import { type MeusModulosItem } from "../../../services/treinamentoVendedor";
import { detalheModulo } from "../../../services/treinamento";
import { type ModuloDetalhe } from "../../../services/treinamento";
type SelectedMap = Record<number, number | null>;

export default function VendedorModuloPage() {
  const { id } = useParams();
  const moduloId = Number(id);
  const navigate = useNavigate();

  const [modulo, setModulo] = useState<ModuloDetalheDTO | null>(null);
  const [meInfo, setMeInfo] = useState<MeusModulosItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [consumidos, setConsumidos] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<SelectedMap>({});
  const [enviandoQuiz, setEnviandoQuiz] = useState(false);
  const [resultadoQuiz, setResultadoQuiz] = useState<{
    score: number;
    total: number;
    aprovado: boolean;
  } | null>(null);

  function mapModuloDetalheToDTO(det: ModuloDetalhe): ModuloDetalheDTO {
    return {
      id: det.id,
      titulo: det.titulo,
      descricao: det.descricao ?? "", // garante string
      exigir_consumo_antes_quiz: !!det.exigir_consumo_antes_quiz, // garante boolean
      conteudos: (det.conteudos ?? []).map((c, idx) => ({
        id: c.id,
        tipo: c.tipo,
        titulo: c.titulo ?? c.url,
        url: c.url,
        ordem: idx, // se o back não manda ordem, usa o índice
      })),
      perguntas: (det.perguntas ?? []).map((p, idx) => ({
        id: p.id,
        titulo: p.titulo,
        ordem: idx,
        respostas: p.respostas.map((r) => ({
          id: r.id,
          texto: r.texto,
        })),
      })),
    };
  }


  useEffect(() => {
    if (!moduloId) return;
    async function carregar() {
      setErro(null);
      setLoading(true);
      try {
        const [det, meus] = await Promise.all([
          detalheModulo(moduloId),
          meusModulos(),
        ]);

        setModulo(mapModuloDetalheToDTO(det));

        const me = meus.find((m) => m.id === moduloId) || null;
        setMeInfo(me || null);

        // estado inicial "consumido" (se tiver só 1 vídeo e 1 pdf)
        const initial: Record<number, boolean> = {};
        if (det.conteudos) {
          det.conteudos.forEach((c) => {
            if (c.tipo === "VIDEO" && me?.video_ok) initial[c.id] = true;
            if (c.tipo === "PDF" && me?.pdf_ok) initial[c.id] = true;
          });
        }
        setConsumidos(initial);

        // zera quiz selecionado quando entra
        const sel: SelectedMap = {};
        det.perguntas?.forEach((p) => {
          sel[p.id] = null;
        });
        setSelected(sel);
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.erro ||
          "Não foi possível carregar o módulo.";
        setErro(msg);
        Toast.erro(msg);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [moduloId]);

  const consumoOk = useMemo(() => {
    if (!modulo) return false;
    if (!modulo.exigir_consumo_antes_quiz) return true;
    // se exige consumo: todos conteúdos marcados
    if (!modulo.conteudos?.length) return true;
    return modulo.conteudos.every((c) => consumidos[c.id]);
  }, [modulo, consumidos]);

  const quizCompleto = useMemo(() => {
    if (!modulo) return false;
    if (!modulo.perguntas?.length) return false;
    return modulo.perguntas.every((p) => !!selected[p.id]);
  }, [modulo, selected]);

  async function handleConsumir(conteudoId: number) {
    try {
      await consumirConteudo(moduloId, conteudoId);
      setConsumidos((prev) => ({ ...prev, [conteudoId]: true }));
      Toast.mensagem("Conteúdo marcado como consumido ✅");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.erro ||
        "Não foi possível registrar o consumo.";
      Toast.erro(msg);
    }
  }

  async function handleEnviarQuiz() {
    if (!modulo) return;
    if (!consumoOk && modulo.exigir_consumo_antes_quiz) {
      Toast.erro("Você precisa consumir o conteúdo antes de fazer o quiz.");
      return;
    }
    if (!quizCompleto) {
      Toast.erro("Responda todas as perguntas antes de enviar.");
      return;
    }

    const respostas = (modulo.perguntas ?? []).map((p) => ({
      pergunta_id: p.id,
      resposta_id: selected[p.id] as number,
    }));
    setEnviandoQuiz(true);
    try {
      const resp = await responderQuiz(moduloId, { respostas });
      setResultadoQuiz(resp);
      Toast.mensagem(
        resp.aprovado
          ? `Parabéns! Você foi aprovado com ${resp.score}/${resp.total} ✅`
          : `Você fez ${resp.score}/${resp.total}. Continue treinando 💪`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.erro ||
        "Não foi possível enviar o quiz.";
      Toast.erro(msg);
    } finally {
      setEnviandoQuiz(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <CircularProgress />
      </div>
    );
  }

  if (erro || !modulo) {
    return (
      <div className="grid gap-3">
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 3, width: "fit-content" }}
        >
          Voltar
        </Button>
        <Alert severity="error" variant="outlined">
          {erro ?? "Módulo não encontrado."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Typography variant="h4" fontWeight={900}>
            {modulo.titulo}
          </Typography>
          {modulo.descricao && (
            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
              className="whitespace-pre-line"
            >
              {modulo.descricao}
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            {modulo.exigir_consumo_antes_quiz && (
              <Chip
                size="small"
                label="Precisa ver o conteúdo antes do quiz"
                color="warning"
                variant="outlined"
              />
            )}
            {meInfo?.concluido && (
              <Chip
                size="small"
                label="Módulo concluído"
                color="success"
                icon={<CheckCircleRoundedIcon />}
              />
            )}
          </Stack>
        </div>

        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
        >
          Voltar
        </Button>
      </div>

      {/* LAYOUT 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CONTEÚDOS */}
        <div className="lg:col-span-1 grid gap-4">
          <Card
            elevation={0}
            className="rounded-2xl"
            sx={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <CardContent className="grid gap-3">
              <Stack direction="row" spacing={1} alignItems="center">
                <PlayCircleFilledRoundedIcon />
                <Typography variant="h6" fontWeight={900}>
                  Conteúdo
                </Typography>
              </Stack>

              {modulo.conteudos?.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nenhum conteúdo cadastrado para este módulo.
                </Typography>
              )}

              <div className="grid gap-3">
                {modulo.conteudos?.map((c) => {
                  const isVideo = c.tipo === "VIDEO";
                  const isPdf = c.tipo === "PDF";
                  const done = consumidos[c.id];

                  return (
                    <Card
                      key={c.id}
                      elevation={0}
                      className="rounded-2xl"
                      sx={{
                        border: "1px solid rgba(0,0,0,0.10)",
                        bgcolor: "rgba(15,23,42,0.01)",
                      }}
                    >
                      <CardContent sx={{ p: 2.0 }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              {isVideo && <PlayCircleFilledRoundedIcon fontSize="small" />}
                              {isPdf && <PictureAsPdfRoundedIcon fontSize="small" />}
                              <Typography fontWeight={800}>{c.titulo || c.url}</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {isVideo ? "Vídeo" : isPdf ? "PDF" : "Conteúdo"}
                            </Typography>
                          </div>

                          <Stack spacing={1} alignItems="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 999 }}
                              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                              onClick={() => window.open(c.url, "_blank")}
                            >
                              Abrir
                            </Button>
                            <Button
                              size="small"
                              variant={done ? "contained" : "text"}
                              color={done ? "success" : "primary"}
                              sx={{ borderRadius: 999, fontSize: 12 }}
                              onClick={() => handleConsumir(c.id)}
                            >
                              {done ? "Consumido" : "Marcar como consumido"}
                            </Button>
                          </Stack>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* resumo rápido */}
          <Card
            elevation={0}
            className="rounded-2xl"
            sx={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <CardContent className="grid gap-2">
              <Typography variant="h6" fontWeight={900}>
                Progresso
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Módulo
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {meInfo?.progresso_percent ?? 0}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={meInfo?.progresso_percent ?? 0}
                sx={{ height: 8, borderRadius: 99, bgcolor: "rgba(0,0,0,0.06)" }}
              />
              {meInfo?.quiz_ok && (
                <Typography variant="body2" color="text.secondary">
                  Último quiz: {meInfo.score_quiz ?? 0}% de acerto.
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QUIZ */}
        <div className="lg:col-span-2 grid gap-4">
          <Card
            elevation={0}
            className="rounded-2xl"
            sx={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <CardContent className="grid gap-3">
              <Stack direction="row" spacing={1} alignItems="center">
                <QuizRoundedIcon />
                <Typography variant="h6" fontWeight={900}>
                  Quiz
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${modulo.perguntas?.length} perguntas`}
                />
              </Stack>

              {modulo.exigir_consumo_antes_quiz && !consumoOk && (
                <Alert severity="info" variant="outlined">
                  Você precisa marcar os conteúdos como consumidos antes de concluir o quiz.
                </Alert>
              )}

              {modulo.perguntas?.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma pergunta cadastrada para este módulo.
                </Typography>
              )}

              <Divider />

              <div className="grid gap-4">
                {modulo.perguntas?.map((p, idx) => (
                  <Card
                    key={p.id}
                    elevation={0}
                    className="rounded-2xl"
                    sx={{
                      border: "1px solid rgba(0,0,0,0.10)",
                      bgcolor: "rgba(15,23,42,0.01)",
                    }}
                  >
                    <CardContent className="grid gap-2">
                      <Typography fontWeight={800}>
                        {idx + 1}. {p.titulo}
                      </Typography>

                      <RadioGroup
                        value={selected[p.id] ?? ""}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [p.id]: Number(e.target.value),
                          }))
                        }
                      >
                        {p.respostas.map((r) => (
                          <FormControlLabel
                            key={r.id}
                            value={r.id}
                            control={<Radio />}
                            label={r.texto}
                          />
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {resultadoQuiz && (
                <Alert
                  severity={resultadoQuiz.aprovado ? "success" : "warning"}
                  variant="outlined"
                >
                  Você fez {resultadoQuiz.score}/{resultadoQuiz.total}.{" "}
                  {resultadoQuiz.aprovado
                    ? "Parabéns, você foi aprovado! ✅"
                    : "Ainda não foi aprovado, continue treinando."}
                </Alert>
              )}

              <Divider sx={{ my: 1.5 }} />

              <div className="flex justify-end gap-1.5">
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 3 }}
                  onClick={() => navigate(-1)}
                  startIcon={<ArrowBackRoundedIcon />}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  sx={{ borderRadius: 3 }}
                  startIcon={<SaveRoundedIcon />}
                  disabled={
                    enviandoQuiz ||
                    !quizCompleto ||
                    (modulo.exigir_consumo_antes_quiz && !consumoOk)
                  }
                  onClick={handleEnviarQuiz}
                >
                  {enviandoQuiz ? "Enviando..." : "Enviar respostas"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

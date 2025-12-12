import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Stack,
  Typography,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

import Toast from "../../../utils/Toast";
import { meusModulos, consumirConteudo, responderQuiz } from "../../../services/treinamentoVendedor";
import { detalheModulo, type ModuloDetalhe } from "../../../services/treinamento";
import { type ModuloDetalheDTO } from "../../../services/treinamento";
import { type MeusModulosItem } from "../../../services/treinamentoVendedor";

type SelectedMap = Record<number, number | null>;
type Etapa = "video" | "pdf" | "quiz";

function toEmbedYouTube(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default function VendedorModuloPage() {
  const { id } = useParams();
  const moduloId = Number(id);
  const navigate = useNavigate();

  const [modulo, setModulo] = useState<ModuloDetalheDTO | null>(null);
  const [meInfo, setMeInfo] = useState<MeusModulosItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [tab, setTab] = useState<Etapa>("video");

  const [consumidos, setConsumidos] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<SelectedMap>({});
  const [enviandoQuiz, setEnviandoQuiz] = useState(false);

  const [quizReady, setQuizReady] = useState(false);
  const [openReadyDialog, setOpenReadyDialog] = useState(false);

  const [resultadoQuiz, setResultadoQuiz] = useState<{
    score: number;
    total: number;
    aprovado: boolean;
  } | null>(null);

  function mapModuloDetalheToDTO(det: ModuloDetalhe): ModuloDetalheDTO {
    return {
      id: det.id,
      titulo: det.titulo,
      descricao: det.descricao ?? "",
      exigir_consumo_antes_quiz: !!det.exigir_consumo_antes_quiz,
      conteudos: (det.conteudos ?? []).map((c, idx) => ({
        id: c.id,
        tipo: c.tipo,
        titulo: c.titulo ?? c.url,
        url: c.url,
        ordem: idx,
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
        const [det, meus] = await Promise.all([detalheModulo(moduloId), meusModulos()]);
        const dto = mapModuloDetalheToDTO(det);
        setModulo(dto);

        const me = meus.find((m) => m.id === moduloId) || null;
        setMeInfo(me);

        // consumidos iniciais (como seu código)
        const initial: Record<number, boolean> = {};
        det.conteudos?.forEach((c) => {
          if (c.tipo === "VIDEO" && me?.video_ok) initial[c.id] = true;
          if (c.tipo === "PDF" && me?.pdf_ok) initial[c.id] = true;
        });
        setConsumidos(initial);

        // quiz selections
        const sel: SelectedMap = {};
        det.perguntas?.forEach((p) => (sel[p.id] = null));
        setSelected(sel);

        // tab inicial inteligente
        const hasVideo = dto.conteudos?.some((c) => c.tipo === "VIDEO" && c.url);
        const hasPdf = dto.conteudos?.some((c) => c.tipo === "PDF" && c.url);
        if (hasVideo) setTab("video");
        else if (hasPdf) setTab("pdf");
        else setTab("quiz");
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

  const videoConteudo = useMemo(
    () => modulo?.conteudos?.find((c) => c.tipo === "VIDEO"),
    [modulo]
  );
  const pdfConteudo = useMemo(
    () => modulo?.conteudos?.find((c) => c.tipo === "PDF"),
    [modulo]
  );

  const videoUrl = videoConteudo?.url ?? "";
  const pdfUrl = pdfConteudo?.url ?? "";
  const youtubeEmbed = videoUrl ? toEmbedYouTube(videoUrl) : null;

  const exigir = !!modulo?.exigir_consumo_antes_quiz;

  const doneVideo = !!(videoConteudo?.id && consumidos[videoConteudo.id]);
  const donePdf = !!(pdfConteudo?.id && consumidos[pdfConteudo.id]);

  const consumoOk = useMemo(() => {
    if (!modulo) return false;
    if (!modulo.exigir_consumo_antes_quiz) return true;
    if (!modulo.conteudos?.length) return true;
    return modulo.conteudos.every((c) => consumidos[c.id]);
  }, [modulo, consumidos]);

  const quizCompleto = useMemo(() => {
    if (!modulo?.perguntas?.length) return false;
    return modulo.perguntas.every((p) => !!selected[p.id]);
  }, [modulo, selected]);

  const canOpenPdf = !exigir || doneVideo || !videoUrl;
  const canOpenQuiz = !exigir || (consumoOk && quizReady);

  const stepsTotal = useMemo(() => {
    const hasVideo = !!videoUrl;
    const hasPdf = !!pdfUrl;
    return (hasVideo ? 1 : 0) + (hasPdf ? 1 : 0) + 1;
  }, [videoUrl, pdfUrl]);

  const stepsDone = useMemo(() => {
    const hasVideo = !!videoUrl;
    const hasPdf = !!pdfUrl;
    return (hasVideo ? (doneVideo ? 1 : 0) : 0) + (hasPdf ? (donePdf ? 1 : 0) : 0) + (quizReady ? 1 : 0);
  }, [videoUrl, pdfUrl, doneVideo, donePdf, quizReady]);

  const progressPct = stepsTotal ? Math.round((stepsDone / stepsTotal) * 100) : 0;

  async function handleConsumir(conteudoId: number) {
    try {
      await consumirConteudo(moduloId, conteudoId);
      setConsumidos((prev) => ({ ...prev, [conteudoId]: true }));
      Toast.mensagem("Conteúdo marcado como consumido ✅");

      // auto-avanço se exigir
      if (exigir) {
        if (videoConteudo?.id === conteudoId && pdfUrl) setTab("pdf");
        if (pdfConteudo?.id === conteudoId) setOpenReadyDialog(true);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.erro ||
        "Não foi possível registrar o consumo.";
      Toast.erro(msg);
    }
  }

  function tryOpenQuizTab() {
    if (!exigir) {
      setTab("quiz");
      return;
    }
    if (!consumoOk) {
      Toast.erro("Conclua o conteúdo antes de acessar o quiz.");
      return;
    }
    if (!quizReady) {
      setOpenReadyDialog(true);
      return;
    }
    setTab("quiz");
  }

  function confirmReady() {
    setQuizReady(true);
    setOpenReadyDialog(false);
    Toast.mensagem("Bora! 🚀 Quiz liberado.");
    setTab("quiz");
  }

  async function handleEnviarQuiz() {
    if (!modulo) return;

    if (exigir && !canOpenQuiz) {
      Toast.erro("Você precisa concluir o conteúdo e confirmar que está pronto.");
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (erro || !modulo) {
    return (
      <Box sx={{ display: "grid", gap: 2 }}>
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
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ minWidth: 260 }}>
          <Typography variant="h4" fontWeight={900}>
            {modulo.titulo}
          </Typography>

          {modulo.descricao && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }} className="whitespace-pre-line">
              {modulo.descricao}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: "wrap", gap: 1 }}>
            {modulo.exigir_consumo_antes_quiz && (
              <Chip size="small" label="Precisa ver o conteúdo antes do quiz" color="warning" variant="outlined" />
            )}
            {!!meInfo?.concluido && (
              <Chip size="small" label="Módulo concluído" color="success" icon={<CheckCircleRoundedIcon />} />
            )}
          </Stack>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
        >
          Voltar
        </Button>
      </Box>

      {/* PROGRESSO "FASE" */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ display: "grid", gap: 1.25 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <EmojiEventsRoundedIcon fontSize="small" />
            <Typography fontWeight={900}>Seu progresso</Typography>
            <Chip size="small" variant="outlined" label={`${progressPct}%`} />
            {resultadoQuiz?.aprovado && (
              <Chip size="small" color="success" icon={<CheckCircleRoundedIcon />} label="Aprovado ✅" />
            )}
          </Stack>
          <LinearProgress variant="determinate" value={progressPct} sx={{ height: 8, borderRadius: 99 }} />

          {!!meInfo && (
            <Typography variant="body2" color="text.secondary">
              Progresso do módulo: <strong>{meInfo.progresso_percent ?? 0}%</strong>
              {meInfo.quiz_ok ? ` • Último quiz: ${meInfo.score_quiz ?? 0}%` : ""}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* CARD PRINCIPAL (COLUNA ÚNICA) */}
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* Tabs (etapas) */}
        <Box sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)", px: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v: Etapa) => {
              if (v === "pdf" && !canOpenPdf) {
                Toast.erro("Conclua o vídeo antes de abrir o PDF.");
                return;
              }
              if (v === "quiz") {
                tryOpenQuizTab();
                return;
              }
              setTab(v);
            }}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value="video"
              disabled={!videoUrl}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlayCircleFilledRoundedIcon fontSize="small" />
                  <span>Vídeo</span>
                  {!!videoUrl && doneVideo && <CheckCircleRoundedIcon fontSize="small" />}
                </Stack>
              }
            />
            <Tab
              value="pdf"
              disabled={!pdfUrl || !canOpenPdf}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <PictureAsPdfRoundedIcon fontSize="small" />
                  <span>PDF</span>
                  {!!pdfUrl && donePdf && <CheckCircleRoundedIcon fontSize="small" />}
                </Stack>
              }
            />
            <Tab
              value="quiz"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <QuizRoundedIcon fontSize="small" />
                  <span>Quiz</span>
                  {quizReady && <CheckCircleRoundedIcon fontSize="small" />}
                </Stack>
              }
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* ETAPA: VIDEO */}
          {tab === "video" && (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Etapa 1 — Vídeo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assista e marque como concluído para liberar a próxima etapa.
                  </Typography>
                </Box>

                {videoConteudo?.id && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Abrir em nova aba">
                      <IconButton onClick={() => window.open(videoUrl, "_blank")}>
                        <OpenInNewRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {exigir && (
                      <Button
                        onClick={() => handleConsumir(videoConteudo.id)}
                        variant={doneVideo ? "outlined" : "contained"}
                        disabled={doneVideo}
                        startIcon={<CheckCircleRoundedIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        {doneVideo ? "Vídeo concluído" : "Marcar como assistido"}
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>

              {!videoUrl && (
                <Alert severity="info">Nenhum vídeo configurado para este módulo.</Alert>
              )}

              {!!videoUrl && (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.12)",
                    bgcolor: "black",
                    aspectRatio: "16 / 9",
                  }}
                >
                  {youtubeEmbed ? (
                    <iframe
                      src={youtubeEmbed}
                      title="Vídeo do módulo"
                      style={{ width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </Box>
              )}

              {exigir && doneVideo && !!pdfUrl && (
                <Alert severity="success" variant="outlined">
                  Parabéns! Próxima etapa liberada: <strong>PDF</strong> 🎉
                </Alert>
              )}
            </Box>
          )}

          {/* ETAPA: PDF */}
          {tab === "pdf" && (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Etapa 2 — PDF
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leia o material e marque como lido para liberar o quiz.
                  </Typography>
                </Box>

                {pdfConteudo?.id && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Abrir em nova aba">
                      <IconButton onClick={() => window.open(pdfUrl, "_blank")}>
                        <OpenInNewRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {exigir && (
                      <Button
                        onClick={() => handleConsumir(pdfConteudo.id)}
                        variant={donePdf ? "outlined" : "contained"}
                        disabled={donePdf}
                        startIcon={<CheckCircleRoundedIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        {donePdf ? "PDF lido" : "Marcar como lido"}
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>

              {!pdfUrl && <Alert severity="info">Nenhum PDF configurado para este módulo.</Alert>}

              {!!pdfUrl && (
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.12)",
                    height: { xs: 520, md: 640 },
                    bgcolor: "rgba(15,23,42,0.98)",
                  }}
                >
                  <iframe
                    src={pdfUrl}
                    title="PDF do módulo"
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                </Box>
              )}

              {exigir && donePdf && (
                <Alert severity="success" variant="outlined">
                  Boa! Agora confirme que está pronto para o quiz ✅
                </Alert>
              )}
            </Box>
          )}

          {/* ETAPA: QUIZ */}
          {tab === "quiz" && (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Etapa 3 — Quiz
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Responda e envie para ver seu resultado.
                  </Typography>
                </Box>

                {exigir && !quizReady && (
                  <Button
                    variant="contained"
                    startIcon={<QuizRoundedIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={() => setOpenReadyDialog(true)}
                    disabled={!consumoOk}
                  >
                    Estou pronto para o quiz
                  </Button>
                )}
              </Stack>

              {exigir && !consumoOk && (
                <Alert severity="info" variant="outlined">
                  Você precisa concluir o conteúdo antes de acessar o quiz.
                </Alert>
              )}

              {exigir && consumoOk && !quizReady && (
                <Alert severity="warning" variant="outlined">
                  Último passo: confirme que está pronto para iniciar.
                </Alert>
              )}

              {/* Conteúdo do quiz só aparece quando liberado */}
              {(!exigir || canOpenQuiz) && (
                <>
                  {modulo.perguntas?.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                      Nenhuma pergunta cadastrada para este módulo.
                    </Alert>
                  ) : (
                    <Box sx={{ display: "grid", gap: 2 }}>
                      {modulo.perguntas?.map((p, idx) => (
                        <Card
                          key={p.id}
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: "1px solid rgba(0,0,0,0.10)",
                            bgcolor: "rgba(15,23,42,0.01)",
                          }}
                        >
                          <CardContent sx={{ display: "grid", gap: 1.25 }}>
                            <Typography fontWeight={900}>
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
                    </Box>
                  )}

                  {resultadoQuiz && (
                    <Alert severity={resultadoQuiz.aprovado ? "success" : "warning"} variant="outlined">
                      Você fez <strong>{resultadoQuiz.score}</strong>/{resultadoQuiz.total}.{" "}
                      {resultadoQuiz.aprovado ? "Parabéns, você foi aprovado! ✅" : "Ainda não foi aprovado. Continue treinando 💪"}
                    </Alert>
                  )}

                  <Divider sx={{ my: 1.5 }} />

                  <Stack direction="row" justifyContent="flex-end" spacing={1.2}>
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
                      disabled={enviandoQuiz || !quizCompleto || (exigir && !canOpenQuiz)}
                      onClick={handleEnviarQuiz}
                    >
                      {enviandoQuiz ? "Enviando..." : "Enviar respostas"}
                    </Button>
                  </Stack>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog: pronto pro quiz */}
      <Dialog open={openReadyDialog} onClose={() => setOpenReadyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Pronto para o quiz?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Confirme apenas quando tiver consumido o conteúdo. Boa sorte! 🍀
          </Typography>

          {exigir && !consumoOk && (
            <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
              Você ainda não concluiu todas as etapas do conteúdo.
            </Alert>
          )}

          {exigir && consumoOk && (
            <Alert severity="success" variant="outlined" sx={{ mt: 2 }}>
              Tudo certo! Conteúdo concluído ✅
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenReadyDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Ainda não
          </Button>
          <Button
            onClick={confirmReady}
            variant="contained"
            sx={{ borderRadius: 2 }}
            disabled={exigir && !consumoOk}
            startIcon={<QuizRoundedIcon />}
          >
            Sim, estou pronto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

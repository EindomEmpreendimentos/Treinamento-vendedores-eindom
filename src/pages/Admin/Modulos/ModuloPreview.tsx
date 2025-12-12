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
  Stack,
  Typography,
  Tabs,
  Tab,
  Radio,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

import Toast from "../../../utils/Toast";
import { detalheModulo, type ModuloDetalhe } from "../../../services/treinamento";

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

type Etapa = "video" | "pdf" | "quiz";

export default function ModuloPreview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const moduloId = Number(id);

  const [modulo, setModulo] = useState<ModuloDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [tab, setTab] = useState<Etapa>("video");

  // progresso (preview local)
  const [doneVideo, setDoneVideo] = useState(false);
  const [donePdf, setDonePdf] = useState(false);
  const [quizReady, setQuizReady] = useState(false);
  const [openReadyDialog, setOpenReadyDialog] = useState(false);

  useEffect(() => {
    if (!moduloId) return;

    async function carregar() {
      setErro(null);
      setLoading(true);
      try {
        const data = await detalheModulo(moduloId);
        setModulo(data);

        // auto-libera etapas inexistentes
        const hasVideo = data.conteudos?.some((c: any) => c.tipo === "VIDEO" && c.url);
        const hasPdf = data.conteudos?.some((c: any) => c.tipo === "PDF" && c.url);

        setDoneVideo(!hasVideo);
        setDonePdf(!hasPdf);

        // tab inicial inteligente
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
    () => modulo?.conteudos?.find((c: any) => c.tipo === "VIDEO"),
    [modulo]
  );
  const pdfConteudo = useMemo(
    () => modulo?.conteudos?.find((c: any) => c.tipo === "PDF"),
    [modulo]
  );

  const videoUrl = videoConteudo?.url ?? "";
  const pdfUrl = pdfConteudo?.url ?? "";
  const youtubeEmbed = videoUrl ? toEmbedYouTube(videoUrl) : null;

  const exigir = !!modulo?.exigir_consumo_antes_quiz;

  const totalPerguntas = modulo?.perguntas?.length ?? 0;
  const totalRespostas = modulo?.perguntas?.reduce(
    (acc: number, p: any) => acc + (p.respostas?.length ?? 0),
    0
  );

  // gating
  const canOpenPdf = !exigir || doneVideo; // se exigir, só libera PDF após vídeo
  const canOpenQuiz = !exigir || (doneVideo && donePdf && quizReady); // quiz só depois do "pronto"

  const etapasExistentes = useMemo(() => {
    const hasVideo = !!videoUrl;
    const hasPdf = !!pdfUrl;
    return {
      hasVideo,
      hasPdf,
      hasQuiz: true, // quiz sempre existe como etapa (mesmo sem perguntas)
    };
  }, [videoUrl, pdfUrl]);

  const totalSteps =
    (etapasExistentes.hasVideo ? 1 : 0) + (etapasExistentes.hasPdf ? 1 : 0) + 1;

  const doneSteps =
    (etapasExistentes.hasVideo ? (doneVideo ? 1 : 0) : 0) +
    (etapasExistentes.hasPdf ? (donePdf ? 1 : 0) : 0) +
    (quizReady ? 1 : 0);

  const progressPct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  function goNextAfterVideo() {
    if (etapasExistentes.hasPdf) setTab("pdf");
    else setTab("quiz");
  }

  function goNextAfterPdf() {
    setTab("quiz");
  }

  function onMarkVideoDone() {
    if (doneVideo) return;
    setDoneVideo(true);
    Toast.mensagem("Boa! Vídeo concluído ✅");
    if (exigir) goNextAfterVideo();
  }

  function onMarkPdfDone() {
    if (donePdf) return;
    setDonePdf(true);
    Toast.mensagem("Perfeito! PDF lido ✅");
    if (exigir) goNextAfterPdf();
  }

  function tryOpenQuizTab() {
    if (!exigir) {
      setTab("quiz");
      return;
    }

    // se exigir e ainda não está pronto, abre dialog
    if (!quizReady) {
      setOpenReadyDialog(true);
      return;
    }

    // se pronto, mas ainda não concluiu etapas anteriores, não deixa
    if (!doneVideo || !donePdf) {
      Toast.erro("Conclua as etapas anteriores antes do quiz.");
      return;
    }

    setTab("quiz");
  }

  function confirmReady() {
    setQuizReady(true);
    setOpenReadyDialog(false);
    Toast.mensagem("🔥 Partiu quiz! Boa sorte!");
    setTab("quiz");
  }

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ minWidth: 260 }}>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.4 }}>
            {modulo?.titulo || (loading ? "Carregando módulo..." : "Módulo")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Preview faseado (vídeo → PDF → quiz). O admin só visualiza.
          </Typography>

          {modulo && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: "wrap", gap: 1 }}>
              <Chip
                size="small"
                label={exigir ? "Exige consumo antes do quiz" : "Quiz liberado sempre"}
                variant={exigir ? "filled" : "outlined"}
                color={exigir ? "primary" : "default"}
              />
              <Chip size="small" icon={<QuizRoundedIcon />} label={`${totalPerguntas} perguntas`} variant="outlined" />
              <Chip size="small" label={`${totalRespostas} respostas`} variant="outlined" />
            </Stack>
          )}
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderRadius: 3 }}
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </Box>

      {/* Barra de “fase” */}
      {!!modulo && (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ display: "grid", gap: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <EmojiEventsRoundedIcon fontSize="small" />
              <Typography fontWeight={900}>Progresso do módulo</Typography>
              <Chip size="small" label={`${progressPct}%`} variant="outlined" />
              {progressPct === 100 && (
                <Chip size="small" color="success" icon={<CheckCircleRoundedIcon />} label="Tudo pronto!" />
              )}
            </Stack>
            <LinearProgress variant="determinate" value={progressPct} />
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {etapasExistentes.hasVideo && (
                <Chip
                  size="small"
                  icon={<PlayCircleFilledRoundedIcon />}
                  color={doneVideo ? "success" : "default"}
                  variant={doneVideo ? "filled" : "outlined"}
                  label={doneVideo ? "Vídeo concluído" : "Vídeo pendente"}
                />
              )}
              {etapasExistentes.hasPdf && (
                <Chip
                  size="small"
                  icon={<PictureAsPdfRoundedIcon />}
                  color={donePdf ? "success" : "default"}
                  variant={donePdf ? "filled" : "outlined"}
                  label={donePdf ? "PDF lido" : "PDF pendente"}
                />
              )}
              <Chip
                size="small"
                icon={<QuizRoundedIcon />}
                color={quizReady ? "success" : "default"}
                variant={quizReady ? "filled" : "outlined"}
                label={quizReady ? "Pronto pro quiz" : "Aguardando confirmação"}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {erro && (
        <Alert severity="error" variant="outlined">
          {erro}
        </Alert>
      )}

      {loading && !modulo && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && modulo && (
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}
        >
          {/* Tabs liberadas por fase */}
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
                disabled={!etapasExistentes.hasVideo}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PlayCircleFilledRoundedIcon fontSize="small" />
                    <span>Vídeo</span>
                    {doneVideo && <CheckCircleRoundedIcon fontSize="small" />}
                  </Stack>
                }
              />
              <Tab
                value="pdf"
                disabled={!etapasExistentes.hasPdf || !canOpenPdf}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PictureAsPdfRoundedIcon fontSize="small" />
                    <span>PDF</span>
                    {donePdf && <CheckCircleRoundedIcon fontSize="small" />}
                  </Stack>
                }
              />
              <Tab
                value="quiz"
                // tab "clicável" sempre, mas abrimos dialog/validação
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
            {/* VIDEO */}
            {tab === "video" && (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Etapa 1 — Vídeo do módulo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Depois de assistir, marque como concluído para liberar a próxima etapa.
                    </Typography>
                  </Box>

                  {exigir && (
                    <Button
                      onClick={onMarkVideoDone}
                      variant={doneVideo ? "outlined" : "contained"}
                      disabled={doneVideo}
                      startIcon={<CheckCircleRoundedIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      {doneVideo ? "Vídeo concluído" : "Marcar como assistido"}
                    </Button>
                  )}
                </Stack>

                {!videoUrl && (
                  <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
                    Nenhum vídeo configurado para este módulo.
                  </Alert>
                )}

                {videoUrl && (
                  <>
                    <Box
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.12)",
                        bgcolor: "black",
                        aspectRatio: "16 / 9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                      <Chip size="small" variant="outlined" label={videoUrl} />
                      <Tooltip title="Abrir em nova aba">
                        <IconButton onClick={() => window.open(videoUrl, "_blank")}>
                          <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {exigir && doneVideo && (
                        <Chip size="small" color="success" icon={<EmojiEventsRoundedIcon />} label="Parabéns! Etapa concluída 🎉" />
                      )}
                    </Stack>

                    {exigir && doneVideo && etapasExistentes.hasPdf && (
                      <Alert severity="success" variant="outlined">
                        Próxima fase liberada: <strong>PDF</strong> ✅
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* PDF */}
            {tab === "pdf" && (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Etapa 2 — PDF do módulo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Leia o material e marque como lido para liberar o quiz.
                    </Typography>
                  </Box>

                  {exigir && (
                    <Button
                      onClick={onMarkPdfDone}
                      variant={donePdf ? "outlined" : "contained"}
                      disabled={donePdf}
                      startIcon={<CheckCircleRoundedIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      {donePdf ? "PDF lido" : "Marcar como lido"}
                    </Button>
                  )}
                </Stack>

                {!pdfUrl && (
                  <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
                    Nenhum PDF configurado para este módulo.
                  </Alert>
                )}

                {pdfUrl && (
                  <>
                    <Box
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.12)",
                        bgcolor: "rgba(15,23,42,0.98)",
                        height: { xs: 520, md: 640 },
                      }}
                    >
                      <iframe
                        src={pdfUrl}
                        title="PDF do módulo"
                        style={{ width: "100%", height: "100%", border: "none" }}
                      />
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                      <Chip size="small" variant="outlined" label={pdfUrl} />
                      <Tooltip title="Abrir em nova aba">
                        <IconButton onClick={() => window.open(pdfUrl, "_blank")}>
                          <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {exigir && donePdf && (
                        <Chip size="small" color="success" icon={<EmojiEventsRoundedIcon />} label="Boa! Etapa concluída 🎉" />
                      )}
                    </Stack>

                    {exigir && donePdf && (
                      <Alert severity="success" variant="outlined">
                        Agora falta só uma coisa: confirmar que você está pronto para o quiz ✅
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* QUIZ */}
            {tab === "quiz" && (
              <Box sx={{ display: "grid", gap: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Etapa 3 — Quiz do módulo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {exigir
                        ? "Você só chega aqui depois de concluir o conteúdo e confirmar que está pronto."
                        : "Quiz liberado independente do consumo."}
                    </Typography>
                  </Box>

                  {exigir && !quizReady && (
                    <Button
                      onClick={() => setOpenReadyDialog(true)}
                      variant="contained"
                      startIcon={<QuizRoundedIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      Estou pronto para o quiz
                    </Button>
                  )}
                </Stack>

                {exigir && (!doneVideo || !donePdf) && (
                  <Alert severity="warning" variant="outlined">
                    O quiz ainda não está liberado. Conclua as etapas anteriores (vídeo/PDF).
                  </Alert>
                )}

                {exigir && doneVideo && donePdf && !quizReady && (
                  <Alert severity="info" variant="outlined">
                    Último passo: clique em <strong>“Estou pronto para o quiz”</strong>.
                  </Alert>
                )}

                {(!modulo.perguntas || modulo.perguntas.length === 0) && (
                  <Alert severity="info" variant="outlined">
                    Nenhuma pergunta cadastrada ainda para este módulo.
                  </Alert>
                )}

                {/* Mostra quiz somente se liberado (ou se não exigir) */}
                {(!exigir || canOpenQuiz) && (
                  <Card
                    elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.10)", bgcolor: "rgba(2,6,23,0.02)" }}
                  >
                    <CardContent sx={{ display: "grid", gap: 2 }}>
                      <Typography variant="subtitle1" fontWeight={900}>
                        Preview do quiz (visão vendedor)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aqui o admin apenas visualiza; nada é salvo.
                      </Typography>

                      <Divider />

                      <Stack spacing={2.5}>
                        {modulo.perguntas?.map((p: any, idx: number) => (
                          <Card
                            key={p.id}
                            elevation={0}
                            sx={{
                              borderRadius: 3,
                              border: "1px solid rgba(0,0,0,0.10)",
                              bgcolor: "white",
                            }}
                          >
                            <CardContent sx={{ display: "grid", gap: 1.5 }}>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Chip size="small" label={`Pergunta ${idx + 1}`} />
                                <Typography fontWeight={900}>{p.titulo}</Typography>
                              </Stack>

                              <Divider />

                              <Stack spacing={0.5}>
                                {p.respostas?.map((r: any, rIdx: number) => (
                                  <Box
                                    key={r.id ?? rIdx}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 2,
                                      bgcolor: r.correta ? "rgba(22,163,74,0.06)" : "transparent",
                                    }}
                                  >
                                    <Radio checked={false} disabled />
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                      {r.texto}
                                    </Typography>
                                    {r.correta && (
                                      <Chip
                                        size="small"
                                        color="success"
                                        variant="filled"
                                        icon={<CheckCircleRoundedIcon fontSize="small" />}
                                        label="Correta"
                                      />
                                    )}
                                  </Box>
                                ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>

                      {quizReady && (
                        <Alert severity="success" icon={<EmojiEventsRoundedIcon />}>
                          Parabéns! Você chegou no quiz 🎉
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog: pronto pro quiz */}
      <Dialog open={openReadyDialog} onClose={() => setOpenReadyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Pronto para o quiz?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Ao iniciar o quiz, o vendedor deve estar confiante de que consumiu o conteúdo.
          </Typography>

          {exigir && (!doneVideo || !donePdf) && (
            <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
              Você ainda não concluiu todas as etapas. (vídeo/PDF)
            </Alert>
          )}

          {exigir && doneVideo && donePdf && (
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
            disabled={exigir && (!doneVideo || !donePdf)}
            startIcon={<QuizRoundedIcon />}
          >
            Sim, estou pronto
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

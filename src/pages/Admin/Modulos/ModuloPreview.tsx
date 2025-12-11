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
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

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

export default function ModuloPreview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [modulo, setModulo] = useState<ModuloDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tab, setTab] = useState<"video" | "pdf">("video");

  const moduloId = Number(id);

  useEffect(() => {
    if (!moduloId) return;

    async function carregar() {
      setErro(null);
      setLoading(true);
      try {
        const data = await detalheModulo(moduloId);
        setModulo(data);

        // define tab inicial baseado no que existe
        const hasVideo = data.conteudos?.some((c: any) => c.tipo === "VIDEO");
        const hasPdf = data.conteudos?.some((c: any) => c.tipo === "PDF");
        if (hasVideo) setTab("video");
        else if (hasPdf) setTab("pdf");
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

  const totalPerguntas = modulo?.perguntas?.length ?? 0;
  const totalRespostas = modulo?.perguntas?.reduce(
    (acc: number, p: any) => acc + (p.respostas?.length ?? 0),
    0
  );

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.4 }}>
            {modulo?.titulo || (loading ? "Carregando módulo..." : "Módulo")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Visualização do módulo como o vendedor enxerga o conteúdo e o quiz.
          </Typography>

          {modulo && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
              <Chip
                size="small"
                label={modulo.exigir_consumo_antes_quiz ? "Exige consumo antes do quiz" : "Quiz liberado sempre"}
                variant={modulo.exigir_consumo_antes_quiz ? "filled" : "outlined"}
                color={modulo.exigir_consumo_antes_quiz ? "primary" : "default"}
              />
              <Chip
                size="small"
                icon={<QuizRoundedIcon />}
                label={`${totalPerguntas} perguntas`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`${totalRespostas} respostas`}
                variant="outlined"
              />
            </Stack>
          )}
        </div>

        <Stack direction="row" spacing={1.2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ borderRadius: 3 }}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </Stack>
      </div>

      {erro && (
        <Alert severity="error" variant="outlined">
          {erro}
        </Alert>
      )}

      {loading && !modulo && (
        <div className="flex items-center justify-center py-10">
          <CircularProgress />
        </div>
      )}

      {!loading && modulo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Coluna esquerda: Conteúdo */}
          <div className="lg:col-span-2 grid gap-4">
            <Card
              elevation={0}
              className="rounded-2xl"
              sx={{ border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* Tabs header */}
                <Box sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)", px: 2 }}>
                  <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                  >
                    <Tab
                      value="video"
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PlayCircleFilledRoundedIcon fontSize="small" />
                          <span>Vídeo</span>
                        </Stack>
                      }
                      disabled={!videoUrl}
                    />
                    <Tab
                      value="pdf"
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PictureAsPdfRoundedIcon fontSize="small" />
                          <span>PDF</span>
                        </Stack>
                      }
                      disabled={!pdfUrl}
                    />
                  </Tabs>
                </Box>

                <Box sx={{ p: 2.5 }}>
                  {/* Vídeo */}
                  {tab === "video" && (
                    <>
                      {!videoUrl && (
                        <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
                          Nenhum vídeo configurado para este módulo.
                        </Alert>
                      )}

                      {videoUrl && (
                        <div className="grid gap-2">
                          <Typography variant="subtitle2" fontWeight={800}>
                            Vídeo do módulo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Esta é exatamente a experiência que o vendedor terá ao assistir o conteúdo.
                          </Typography>

                          <Box
                            sx={{
                              mt: 2,
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

                          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                            <Chip size="small" variant="outlined" label={videoUrl} />
                            <Tooltip title="Abrir em nova aba">
                              <IconButton onClick={() => window.open(videoUrl, "_blank")}>
                                <OpenInNewRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </div>
                      )}
                    </>
                  )}

                  {/* PDF */}
                  {tab === "pdf" && (
                    <>
                      {!pdfUrl && (
                        <Alert severity="info" icon={<ErrorOutlineRoundedIcon />}>
                          Nenhum PDF configurado para este módulo.
                        </Alert>
                      )}

                      {pdfUrl && (
                        <div className="grid gap-2">
                          <Typography variant="subtitle2" fontWeight={800}>
                            PDF do módulo
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            O vendedor poderá ler o material diretamente assim:
                          </Typography>

                          <Box
                            sx={{
                              mt: 2,
                              borderRadius: 2,
                              overflow: "hidden",
                              border: "1px solid rgba(0,0,0,0.12)",
                              bgcolor: "rgba(15,23,42,0.98)",
                              height: 480,
                            }}
                          >
                            <iframe
                              src={pdfUrl}
                              title="PDF do módulo"
                              style={{ width: "100%", height: "100%", border: "none" }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                            <Chip size="small" variant="outlined" label={pdfUrl} />
                            <Tooltip title="Abrir em nova aba">
                              <IconButton onClick={() => window.open(pdfUrl, "_blank")}>
                                <OpenInNewRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </div>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita: Quiz (visão vendedor) */}
          <div className="grid gap-4">
            <Card
              elevation={0}
              className="rounded-2xl"
              sx={{ border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <CardContent className="grid gap-2">
                <Stack direction="row" spacing={1} alignItems="center">
                  <QuizRoundedIcon fontSize="small" />
                  <Typography variant="h6" fontWeight={900}>
                    Quiz do módulo
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Esta é a forma como o vendedor irá responder o quiz. Aqui o admin apenas visualiza, nada é salvo.
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {(!modulo.perguntas || modulo.perguntas.length === 0) && (
                  <Alert severity="info" variant="outlined">
                    Nenhuma pergunta cadastrada ainda para este módulo.
                  </Alert>
                )}

                <Stack spacing={2.5}>
                  {modulo.perguntas?.map((p: any, idx: number) => (
                    <Card
                      key={p.id}
                      elevation={0}
                      className="rounded-2xl"
                      sx={{
                        border: "1px solid rgba(0,0,0,0.10)",
                        bgcolor: "rgba(2,6,23,0.02)",
                      }}
                    >
                      <CardContent className="grid gap-2">
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip size="small" label={`Pergunta ${idx + 1}`} />
                          <Typography fontWeight={800}>{p.titulo}</Typography>
                        </Stack>

                        <Divider sx={{ my: 1 }} />

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
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

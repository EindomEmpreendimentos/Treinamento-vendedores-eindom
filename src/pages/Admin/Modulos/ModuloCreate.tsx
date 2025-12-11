import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Stack,
  Switch,
  TextField,
  Typography,
  Collapse,
  Radio,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import Toast from "../../../utils/Toast";
import { criarModulo, detalheModulo, atualizarModulo } from "../../../services/treinamento";

type Resposta = { id: string; texto: string; correta: boolean };
type Pergunta = { id: string; titulo: string; respostas: Resposta[] };

const uid = () => crypto.randomUUID();

function perguntaVazia(): Pergunta {
  return {
    id: uid(),
    titulo: "",
    respostas: [
      { id: uid(), texto: "", correta: true },
      { id: uid(), texto: "", correta: false },
    ],
  };
}

function isValidUrl(url: string) {
  try {
    if (!url.trim()) return false;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function ModuloCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const isEdit = !!id;
  const moduloId = isEdit ? Number(id) : null;

  const [loadingInicial, setLoadingInicial] = useState(isEdit);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [exigirConsumo, setExigirConsumo] = useState(true);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([perguntaVazia()]);

  const [saving, setSaving] = useState(false);
  const [erroTopo, setErroTopo] = useState<string | null>(null);

  // 🔄 carregar dados quando estiver em modo edição
  useEffect(() => {
    if (!isEdit || !moduloId) return;

    async function carregar() {
      try {
        setLoadingInicial(true);
        if (moduloId == null) {
          return
        }
        const data = await detalheModulo(moduloId);

        setTitulo(data.titulo ?? "");
        setDescricao(data.descricao ?? "");
        setExigirConsumo(
          typeof data.exigir_consumo_antes_quiz === "boolean"
            ? data.exigir_consumo_antes_quiz
            : true
        );

        // conteúdo: pega primeiro VIDEO e primeiro PDF, se existirem
        const video = data.conteudos?.find((c) => c.tipo === "VIDEO");
        const pdf = data.conteudos?.find((c) => c.tipo === "PDF");

        setVideoUrl(video?.url ?? "");
        setPdfUrl(pdf?.url ?? "");

        // perguntas + respostas
        if (data.perguntas && data.perguntas.length > 0) {
          setPerguntas(
            data.perguntas.map((p) => ({
              id: String(p.id ?? uid()),
              titulo: p.titulo ?? "",
              respostas: (p.respostas ?? []).map((r) => ({
                id: String(r.id ?? uid()),
                texto: r.texto ?? "",
                correta: !!r.correta,
              })),
            }))
          );
        } else {
          setPerguntas([perguntaVazia()]);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.erro ||
          "Não foi possível carregar o módulo.";
        setErroTopo(msg);
        Toast.erro(msg);
      } finally {
        setLoadingInicial(false);
      }
    }

    carregar();
  }, [isEdit, moduloId]);

  const valido = useMemo(() => {
    if (!titulo.trim()) return false;
    if (!videoUrl.trim() && !pdfUrl.trim()) return false;
    if (perguntas.length === 0) return false;

    for (const p of perguntas) {
      if (!p.titulo.trim()) return false;
      if (p.respostas.length < 2) return false;
      const corretas = p.respostas.filter((r) => r.correta).length;
      if (corretas !== 1) return false;
      if (p.respostas.some((r) => !r.texto.trim())) return false;
    }
    return true;
  }, [titulo, videoUrl, pdfUrl, perguntas]);

  const progresso = useMemo(() => {
    const checks = [
      !!titulo.trim(),
      !!(videoUrl.trim() || pdfUrl.trim()),
      perguntas.length > 0 && perguntas.every((p) => p.titulo.trim()),
      perguntas.length > 0 &&
        perguntas.every(
          (p) => p.respostas.length >= 2 && p.respostas.every((r) => r.texto.trim())
        ),
      perguntas.length > 0 &&
        perguntas.every((p) => p.respostas.filter((r) => r.correta).length === 1),
    ];
    const ok = checks.filter(Boolean).length;
    return Math.round((ok / checks.length) * 100);
  }, [titulo, videoUrl, pdfUrl, perguntas]);

  const addPergunta = () => setPerguntas((prev) => [...prev, perguntaVazia()]);
  const rmPergunta = (id: string) =>
    setPerguntas((prev) => prev.filter((p) => p.id !== id));

  const setPerguntaTitulo = (id: string, v: string) =>
    setPerguntas((prev) => prev.map((p) => (p.id === id ? { ...p, titulo: v } : p)));

  const addResposta = (pid: string) =>
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
              ...p,
              respostas: [...p.respostas, { id: uid(), texto: "", correta: false }],
            }
          : p
      )
    );

  const rmResposta = (pid: string, rid: string) =>
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === pid
          ? { ...p, respostas: p.respostas.filter((r) => r.id !== rid) }
          : p
      )
    );

  const setRespostaTexto = (pid: string, rid: string, v: string) =>
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
              ...p,
              respostas: p.respostas.map((r) =>
                r.id === rid ? { ...r, texto: v } : r
              ),
            }
          : p
      )
    );

  const marcarCorreta = (pid: string, rid: string) =>
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === pid
          ? {
              ...p,
              respostas: p.respostas.map((r) => ({
                ...r,
                correta: r.id === rid,
              })),
            }
          : p
      )
    );

  const checklist = [
    { ok: !!titulo.trim(), label: "Título do módulo" },
    { ok: !!(videoUrl.trim() || pdfUrl.trim()), label: "Vídeo ou PDF informado" },
    { ok: perguntas.length > 0, label: "Pelo menos 1 pergunta" },
    {
      ok:
        perguntas.length > 0 &&
        perguntas.every((p) => p.titulo.trim()) &&
        perguntas.every((p) => p.respostas.length >= 2),
      label: "Perguntas com respostas (mín. 2)",
    },
    {
      ok:
        perguntas.length > 0 &&
        perguntas.every((p) => p.respostas.filter((r) => r.correta).length === 1),
      label: "Exatamente 1 correta por pergunta",
    },
  ];

  const salvar = async () => {
    setErroTopo(null);
    if (!valido) {
      Toast.erro("Ainda faltam campos para salvar.");
      return;
    }

    const payloadCreate = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      conteudos: {
        video_url: videoUrl.trim() || null,
        pdf_url: pdfUrl.trim() || null,
      },
      regras: {
        exigir_consumo_antes_quiz: exigirConsumo,
      },
      quiz: {
        perguntas: perguntas.map((p) => ({
          titulo: p.titulo.trim(),
          respostas: p.respostas.map((r) => ({
            texto: r.texto.trim(),
            correta: r.correta,
          })),
        })),
      },
    };

    setSaving(true);
    try {
      if (isEdit && moduloId) {
        // 🔧 por enquanto o backend de update suporta apenas campos simples
        await atualizarModulo(moduloId, {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          exigir_consumo_antes_quiz: exigirConsumo,
          // se depois você expor update de conteudos/quiz, é só completar aqui
        });
        Toast.mensagem("Módulo atualizado ✅");
      } else {
        await criarModulo(payloadCreate);
        Toast.mensagem("Módulo criado ✅");
      }

      navigate("/admin/modulos", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.erro ||
        "Não foi possível salvar o módulo.";
      setErroTopo(msg);
      Toast.erro(msg);
    } finally {
      setSaving(false);
    }
  };

  const videoOk = isValidUrl(videoUrl);
  const pdfOk = isValidUrl(pdfUrl);

  const tituloHeader = isEdit ? "Editar módulo" : "Novo módulo";
  const subtituloHeader = isEdit
    ? "Ajuste conteúdo e regras do módulo."
    : "Cadastre conteúdo (vídeo/PDF) e monte o quiz.";

  const disabled = saving || loadingInicial;

  return (
    <div className="grid gap-5">
      {/* Header sticky */}
      <div className="sticky top-3 z-10">
        <Card elevation={0} className="rounded-2xl">
          <CardContent className="py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: -0.4 }}>
                  {tituloHeader}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.3 }}>
                  {subtituloHeader}
                </Typography>
              </div>
            </div>

            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant={loadingInicial ? "indeterminate" : "determinate"}
                value={loadingInicial ? undefined : progresso}
                sx={{ height: 10, borderRadius: 99, bgcolor: "rgba(0,0,0,0.06)" }}
              />
              {!loadingInicial && (
                <div className="flex items-center mt-2 w-full gap-2">
                  <Typography variant="caption" color="text.secondary">
                    {progresso}% completo
                  </Typography>
                  <Chip
                    size="small"
                    icon={
                      valido ? <CheckCircleRoundedIcon /> : <WarningAmberRoundedIcon />
                    }
                    label={valido ? "Pronto para salvar" : "Faltam campos"}
                    color={valido ? "success" : "warning"}
                    variant={valido ? "filled" : "outlined"}
                  />
                </div>
              )}
            </Box>

            <Collapse in={!!erroTopo}>
              <Alert sx={{ mt: 2 }} severity="error" variant="outlined">
                {erroTopo}
              </Alert>
            </Collapse>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* esquerda */}
        <div className="lg:col-span-2 grid gap-4">
          {/* Informações */}
          <Card elevation={0} className="rounded-2xl" sx={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            <CardContent className="grid gap-3">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label="1" />
                <Typography variant="h6" fontWeight={900}>
                  Informações
                </Typography>
              </Stack>

              <TextField
                label="Título do módulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Módulo 1 - Recepção"
                disabled={disabled}
              />

              <TextField
                label="Descrição (opcional)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                multiline
                minRows={3}
                placeholder="Resumo do que o vendedor vai aprender…"
                disabled={disabled}
              />
            </CardContent>
          </Card>

          {/* Conteúdo */}
          <Card elevation={0} className="rounded-2xl" sx={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            <CardContent className="grid gap-3">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label="2" />
                <Typography variant="h6" fontWeight={900}>
                  Conteúdo
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<VideoLibraryRoundedIcon />}
                  label={videoUrl.trim() ? "Vídeo" : "Sem vídeo"}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<PictureAsPdfRoundedIcon />}
                  label={pdfUrl.trim() ? "PDF" : "Sem PDF"}
                />
              </Stack>

              <TextField
                label="URL do vídeo (YouTube/Vimeo/MP4)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                disabled={disabled}
                error={!!videoUrl.trim() && !videoOk}
                helperText={!!videoUrl.trim() && !videoOk ? "URL inválida" : " "}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{ display: "flex", alignItems: "center", pr: 1, color: "text.secondary" }}
                    >
                      <VideoLibraryRoundedIcon fontSize="small" />
                    </Box>
                  ),
                  endAdornment: videoOk ? (
                    <IconButton
                      aria-label="abrir video"
                      onClick={() => window.open(videoUrl.trim(), "_blank")}
                      edge="end"
                    >
                      <OpenInNewRoundedIcon fontSize="small" />
                    </IconButton>
                  ) : null,
                }}
              />

              <TextField
                label="URL do PDF (arquivo público ou CDN)"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://..."
                disabled={disabled}
                error={!!pdfUrl.trim() && !pdfOk}
                helperText={!!pdfUrl.trim() && !pdfOk ? "URL inválida" : " "}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{ display: "flex", alignItems: "center", pr: 1, color: "text.secondary" }}
                    >
                      <PictureAsPdfRoundedIcon fontSize="small" />
                    </Box>
                  ),
                  endAdornment: pdfOk ? (
                    <IconButton
                      aria-label="abrir pdf"
                      onClick={() => window.open(pdfUrl.trim(), "_blank")}
                      edge="end"
                    >
                      <OpenInNewRoundedIcon fontSize="small" />
                    </IconButton>
                  ) : null,
                }}
              />

              <Alert severity="info" variant="outlined">
                Depois a gente troca URL por upload (S3/Cloudinary/Storage).
              </Alert>
            </CardContent>
          </Card>

          {/* Quiz */}
          <Card elevation={0} className="rounded-2xl" sx={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label="3" />
                  <Typography variant="h6" fontWeight={900}>
                    Quiz
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<QuizRoundedIcon />}
                    label={`${perguntas.length} perguntas`}
                  />
                </Stack>

                <Button
                  startIcon={<AddRoundedIcon />}
                  onClick={addPergunta}
                  variant="outlined"
                  sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                  disabled={disabled}
                >
                  Adicionar pergunta
                </Button>
              </div>

              <Divider />

              <div className="grid gap-4">
                {perguntas.map((p, idx) => (
                  <Card
                    key={p.id}
                    elevation={0}
                    className="rounded-2xl"
                    sx={{
                      border: "1px solid rgba(0,0,0,0.10)",
                      bgcolor: "rgba(2,6,23,0.02)",
                      transition: "transform .15s ease, border-color .15s ease",
                      "&:hover": { transform: "translateY(-1px)", borderColor: "rgba(0,0,0,0.18)" },
                    }}
                  >
                    <CardContent className="grid gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 grid gap-2">
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip size="small" label={`Pergunta ${idx + 1}`} />
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`${p.respostas.length} respostas`}
                            />
                          </Stack>

                          <TextField
                            label="Enunciado"
                            value={p.titulo}
                            onChange={(e) => setPerguntaTitulo(p.id, e.target.value)}
                            disabled={disabled}
                          />
                        </div>

                        <Tooltip title="Remover pergunta">
                          <span>
                            <IconButton
                              aria-label="remover pergunta"
                              onClick={() => rmPergunta(p.id)}
                              disabled={disabled}
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </div>

                      <Divider />

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <Typography fontWeight={900}>Respostas</Typography>
                          <Button
                            onClick={() => addResposta(p.id)}
                            size="small"
                            startIcon={<AddRoundedIcon />}
                            disabled={disabled}
                          >
                            Adicionar
                          </Button>
                        </div>

                        {p.respostas.map((r, rIdx) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-2"
                            style={{ transition: "opacity .15s ease" }}
                          >
                            <Tooltip title="Marcar como correta">
                              <Radio
                                checked={r.correta}
                                onChange={() => marcarCorreta(p.id, r.id)}
                                disabled={disabled}
                              />
                            </Tooltip>

                            <TextField
                              fullWidth
                              label={r.correta ? "Resposta correta" : `Resposta ${rIdx + 1}`}
                              value={r.texto}
                              onChange={(e) => setRespostaTexto(p.id, r.id, e.target.value)}
                              disabled={disabled}
                            />

                            <Tooltip title="Remover resposta">
                              <span>
                                <IconButton
                                  aria-label="remover resposta"
                                  onClick={() => rmResposta(p.id, r.id)}
                                  disabled={disabled}
                                >
                                  <DeleteRoundedIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </div>
                        ))}

                        <Typography variant="caption" color="text.secondary">
                          Regra: exatamente <b>1</b> correta por pergunta.
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!valido && !loadingInicial && (
                <Alert severity="warning" variant="outlined">
                  Preencha: título + (vídeo ou pdf) + perguntas com 1 correta e respostas
                  preenchidas.
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* direita */}
        <div className="grid gap-4">
          <Card elevation={0} className="rounded-2xl" sx={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            <CardContent className="grid gap-2">
              <Typography variant="h6" fontWeight={900}>
                Regras
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={exigirConsumo}
                    onChange={(e) => setExigirConsumo(e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Exigir vídeo/PDF antes do quiz"
              />

              <Typography variant="body2" color="text.secondary">
                Se ativado, o vendedor só consegue fazer o quiz após consumir o conteúdo.
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} className="rounded-2xl" sx={{ border: "1px solid rgba(0,0,0,0.08)" }}>
            <CardContent className="grid gap-2">
              <Typography variant="h6" fontWeight={900}>
                Checklist
              </Typography>

              <Stack spacing={1.2}>
                {checklist.map((c, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {c.ok ? (
                        <CheckCircleRoundedIcon fontSize="small" />
                      ) : (
                        <WarningAmberRoundedIcon fontSize="small" />
                      )}
                      <Typography variant="body2" className="truncate">
                        {c.label}
                      </Typography>
                    </div>
                    <Chip
                      size="small"
                      label={c.ok ? "OK" : "Pendente"}
                      color={c.ok ? "success" : "default"}
                      variant={c.ok ? "filled" : "outlined"}
                    />
                  </div>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ações finais */}
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderRadius: 3 }}
          disabled={saving}
          onClick={() => history.back()}
        >
          Voltar
        </Button>

        <Tooltip title={!valido && !loadingInicial ? "Complete o checklist para liberar" : ""}>
          <span>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              sx={{ borderRadius: 3, px: 2.2 }}
              disabled={!valido || saving || loadingInicial}
              onClick={salvar}
            >
              {saving ? (isEdit ? "Atualizando..." : "Salvando...") : isEdit ? "Salvar alterações" : "Salvar"}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </div>
  );
}

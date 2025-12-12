import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";

import Toast from "../../../utils/Toast";
import { listarModulos } from "../../../services/treinamento";

type ModuloListItem = {
  id: number;
  titulo: string;
  descricao?: string;
  ativo?: boolean;
  exigir_consumo_antes_quiz?: boolean;
  conteudos?: any[];
  perguntas?: any[];
  criado_em?: string;
  atualizado_em?: string;
};

function formatarData(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ModulosList() {
  const theme = useTheme();
  const [modulos, setModulos] = useState<ModuloListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarModulos() {
    setErro(null);
    setLoading(true);
    try {
      const data = await listarModulos();
      setModulos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.erro ||
        "Não foi possível carregar os módulos.";
      setErro(msg);
      Toast.erro?.(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarModulos();
  }, []);

  const temModulos = modulos.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1240, // 👈 aproveita melhor a tela
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Header sticky (mais “app”) */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 6,
          pb: 2,
          mb: 2,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(2,6,23,.92), rgba(2,6,23,.70))"
              : "linear-gradient(180deg, rgba(248,250,252,.96), rgba(248,250,252,.82))",
          backdropFilter: "blur(10px)",
          borderBottom:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,.08)"
              : "1px solid rgba(2,6,23,.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          gap={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -0.8 }}>
              Módulos
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Crie módulos com vídeo, PDF e quiz (perguntas e respostas).
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="flex-end">
            <Button
              onClick={carregarModulos}
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              sx={{
                borderRadius: 3,
                height: 44,
                px: 2.2,
                whiteSpace: "nowrap",
              }}
              disabled={loading}
            >
              Atualizar
            </Button>

            <Button
              component={Link}
              to="/admin/modulos/novo"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: 3,
                height: 44,
                px: 2.2,
                whiteSpace: "nowrap",
                boxShadow: "0 12px 26px rgba(0,0,0,0.14)",
              }}
            >
              Novo módulo
            </Button>
          </Stack>
        </Stack>
      </Box>

      {erro && (
        <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
          {erro}
        </Alert>
      )}

      {/* Lista */}
      <Box sx={{ display: "grid", gap: 2 }}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              elevation={0}
              sx={{
                borderRadius: 4,
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255,255,255,.10)"
                    : "1px solid rgba(2,6,23,.08)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="45%" height={34} />
                <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: "wrap", gap: 1 }}>
                  <Skeleton variant="rounded" width={90} height={28} />
                  <Skeleton variant="rounded" width={120} height={28} />
                  <Skeleton variant="rounded" width={160} height={28} />
                </Stack>
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <Skeleton variant="text" width="70%" />
                </Box>
              </CardContent>
            </Card>
          ))}

        {!loading &&
          temModulos &&
          modulos.map((m) => {
            const itens = m.conteudos?.length ?? 0;
            const perguntas = m.perguntas?.length ?? 0;
            const atualizadoEm = formatarData(m.atualizado_em || m.criado_em);

            return (
              <Card
                key={m.id}
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(255,255,255,.10)"
                      : "1px solid rgba(2,6,23,.08)",
                  overflow: "hidden",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    gap={2}
                  >
                    {/* Esquerda */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight={950}
                          sx={{
                            letterSpacing: -0.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: { xs: "100%", md: 560 },
                          }}
                        >
                          {m.titulo}
                        </Typography>

                        {typeof m.ativo === "boolean" && (
                          <Chip
                            size="small"
                            icon={m.ativo ? <CheckCircleRoundedIcon /> : <BlockRoundedIcon />}
                            color={m.ativo ? "success" : "default"}
                            variant={m.ativo ? "filled" : "outlined"}
                            label={m.ativo ? "Ativo" : "Inativo"}
                            sx={{ fontWeight: 800 }}
                          />
                        )}

                        {m.exigir_consumo_antes_quiz && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label="Exige consumo antes do quiz"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
                      >
                        <Chip size="small" label={`${itens} itens`} />
                        <Chip size="small" label={`${perguntas} perguntas`} />
                        <Chip size="small" variant="outlined" label={`Atualizado: ${atualizadoEm}`} />
                      </Stack>
                    </Box>

                    {/* Direita: ações (mais limpo) */}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Editar">
                        <IconButton
                          component={Link}
                          to={`/admin/modulos/${m.id}/editar`}
                          sx={{
                            borderRadius: 3,
                            border:
                              theme.palette.mode === "dark"
                                ? "1px solid rgba(255,255,255,.10)"
                                : "1px solid rgba(2,6,23,.08)",
                          }}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Ver">
                        <IconButton
                          component={Link}
                          to={`/admin/modulos/${m.id}/preview`}
                          sx={{
                            borderRadius: 3,
                            border:
                              theme.palette.mode === "dark"
                                ? "1px solid rgba(255,255,255,.10)"
                                : "1px solid rgba(2,6,23,.08)",
                          }}
                        >
                          <VisibilityRoundedIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Mais ações">
                        <IconButton
                          sx={{
                            borderRadius: 3,
                            border:
                              theme.palette.mode === "dark"
                                ? "1px solid rgba(255,255,255,.10)"
                                : "1px solid rgba(2,6,23,.08)",
                          }}
                        >
                          <MoreVertRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Descrição com clamp (não deixa card gigante) */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {m.descricao?.trim()
                      ? m.descricao
                      : "Dica: o vendedor precisa concluir conteúdo (vídeo/PDF) antes do quiz, se a regra estiver ativa."}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}

        {!loading && !temModulos && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border:
                theme.palette.mode === "dark"
                  ? "1px dashed rgba(255,255,255,.20)"
                  : "1px dashed rgba(2,6,23,.18)",
            }}
          >
            <CardContent sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={950}>
                Nenhum módulo criado ainda
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Crie seu primeiro módulo com vídeo, PDF e perguntas do quiz.
              </Typography>
              <Button
                component={Link}
                to="/admin/modulos/novo"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{ borderRadius: 3, height: 44, px: 2.2 }}
              >
                Criar primeiro módulo
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}

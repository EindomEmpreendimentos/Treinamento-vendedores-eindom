import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Box,
  Skeleton,
  Alert,
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
    <div className="grid gap-5">
      {/* Header bonito */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
            Módulos
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Crie módulos com vídeo, PDF e quiz (perguntas e respostas).
          </Typography>
        </div>

        <Stack direction="row" spacing={1.2} alignItems="center">
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
              boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
            }}
          >
            Novo módulo
          </Button>
        </Stack>
      </div>

      <Divider />

      {erro && (
        <Alert severity="error" variant="outlined">
          {erro}
        </Alert>
      )}

      {/* Lista */}
      <div className="grid gap-4">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              elevation={0}
              className="rounded-2xl"
              sx={{
                border: "1px solid rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton variant="text" width="45%" height={34} />
                <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
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
                className="rounded-2xl"
                sx={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  transition: "transform 120ms ease, box-shadow 120ms ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <div className="flex items-start justify-between gap-4">
                    {/* esquerda: infos */}
                    <div className="min-w-0">
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                        <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: -0.2 }}>
                          {m.titulo}
                        </Typography>

                        {typeof m.ativo === "boolean" && (
                          <Chip
                            size="small"
                            icon={m.ativo ? <CheckCircleRoundedIcon /> : <BlockRoundedIcon />}
                            color={m.ativo ? "success" : "default"}
                            variant={m.ativo ? "filled" : "outlined"}
                            label={m.ativo ? "Ativo" : "Inativo"}
                          />
                        )}

                        {m.exigir_consumo_antes_quiz && (
                          <Chip size="small" variant="outlined" label="Exige consumo antes do quiz" />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                        <Chip size="small" label={`${itens} itens`} />
                        <Chip size="small" label={`${perguntas} perguntas`} />
                        <Chip size="small" variant="outlined" label={`Atualizado: ${atualizadoEm}`} />
                      </Stack>
                    </div>

                    {/* direita: ações */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        component={Link}
                        to={`/admin/modulos/${m.id}/editar`}
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                      >
                        Editar
                      </Button>

                      <Button
                        component={Link}
                        to={`/admin/modulos/${m.id}/preview`}
                        variant="text"
                        startIcon={<VisibilityRoundedIcon />}
                        sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                      >
                        Ver
                      </Button>

                      <Tooltip title="Mais ações">
                        <IconButton>
                          <MoreVertRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </div>

                  {/* faixa inferior opcional (deixa mais “sistema”) */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <Typography variant="body2" color="text.secondary">
                      {m.descricao?.trim()
                        ? m.descricao
                        : "Dica: o vendedor precisa concluir conteúdo (vídeo/PDF) antes do quiz, se a regra estiver ativa."}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

        {/* Estado vazio (quando não tiver módulos) */}
        {!loading && !temModulos && (
          <Card elevation={0} className="rounded-2xl" sx={{ border: "1px dashed rgba(0,0,0,0.18)" }}>
            <CardContent sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={900}>
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
      </div>
    </div>
  );
}

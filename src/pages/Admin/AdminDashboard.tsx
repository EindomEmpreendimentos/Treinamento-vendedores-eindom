import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";

import { listarModulos } from "../../services/treinamento";
import {
  metricasModulo,
  type ModuloMetricasAPI,
  type UsuarioProgressoAPI,
} from "../../services/dashboard";
import Toast from "../../utils/Toast";

type UsuarioProgresso = {
  id: number;
  nome: string;
  concluido: boolean;
  progressoPercent: number; // 0..100
  videoOk: boolean;
  pdfOk: boolean;
  quizOk: boolean;
  scoreQuiz?: number; // 0..100
  ultimaAtividade: string;
};

type ModuloProgresso = {
  id: number;
  titulo: string;
  totalUsuarios: number;
  concluidos: number;
  mediaQuiz: number; // 0..100
  usuarios: UsuarioProgresso[];
};

function pct(n: number, d: number) {
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return 0;
  return Math.round((n / d) * 100);
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,.10)"
            : "1px solid rgba(2,6,23,.08)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(15,23,42,.6)"
            : "rgba(255,255,255,.9)",
        minHeight: 116,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack spacing={0.35}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.05 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(2,6,23,0.04)",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const theme = useTheme();
  const [modulos, setModulos] = useState<ModuloProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setErro(null);
      setLoading(true);
      try {
        const lista = await listarModulos();
        const metricasList: ModuloMetricasAPI[] = await Promise.all(
          lista.map((m: any) => metricasModulo(m.id))
        );

        const mapped: ModuloProgresso[] = metricasList.map((m) => ({
          id: m.modulo_id,
          titulo: m.titulo,
          totalUsuarios: m.total_usuarios,
          concluidos: m.concluidos,
          mediaQuiz: m.media_score_quiz ?? 0,
          usuarios: (m.usuarios ?? []).map(mapUsuarioAPIToFront),
        }));

        setModulos(mapped);
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.erro ||
          "Não foi possível carregar as métricas.";
        setErro(msg);
        Toast.erro(msg);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const totals = useMemo(() => {
    const totalModulos = modulos.length;

    const uniqueUserIds = new Set<number>();
    modulos.forEach((m) => m.usuarios.forEach((u) => uniqueUserIds.add(u.id)));
    const totalUsuarios = uniqueUserIds.size;

    const totalConcluidos = modulos.reduce((acc, m) => acc + (m.concluidos ?? 0), 0);
    const totalPossivel = modulos.reduce((acc, m) => acc + (m.totalUsuarios ?? 0), 0);

    const taxaConclusao = pct(totalConcluidos, totalPossivel);

    const mediaQuizGeral =
      totalModulos === 0
        ? 0
        : Math.round(modulos.reduce((acc, m) => acc + (m.mediaQuiz ?? 0), 0) / totalModulos);

    return { totalModulos, totalUsuarios, taxaConclusao, mediaQuizGeral };
  }, [modulos]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1240,         // 👈 aproveita melhor a tela
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Header sticky */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          pb: 2,
          mb: 2,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(2,6,23,.92), rgba(2,6,23,.65))"
              : "linear-gradient(180deg, rgba(248,250,252,.96), rgba(248,250,252,.80))",
          backdropFilter: "blur(8px)",
          borderBottom:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,.08)"
              : "1px solid rgba(2,6,23,.06)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Dashboard (Admin)
            </Typography>
            <Typography color="text.secondary">
              Acompanhe conclusão dos módulos e progresso por vendedor.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {erro && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
          {erro}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Cards */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              mb: 2,
            }}
          >
            <StatCard
              title="Módulos"
              value={`${totals.totalModulos}`}
              subtitle="cadastrados"
              icon={<ViewModuleRoundedIcon />}
            />
            <StatCard
              title="Usuários"
              value={`${totals.totalUsuarios}`}
              subtitle="vendedores ativos"
              icon={<PeopleRoundedIcon />}
            />
            <StatCard
              title="Conclusão (geral)"
              value={`${totals.taxaConclusao}%`}
              subtitle="módulos concluídos / possíveis"
              icon={<TaskAltRoundedIcon />}
            />
            <StatCard
              title="Média do quiz"
              value={`${totals.mediaQuizGeral}%`}
              subtitle="por módulo"
              icon={<QuizRoundedIcon />}
            />
          </Box>

          {/* Tabela */}
          <Card
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
            <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
              <Stack spacing={0.5}>
                <Typography variant="h6" fontWeight={900}>
                  Progresso por módulo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clique na seta para ver os usuários dentro do módulo.
                </Typography>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {modulos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum módulo com métricas ainda.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell width={52} />
                        <TableCell>Módulo</TableCell>
                        <TableCell align="right">Concluídos</TableCell>
                        <TableCell align="right">Taxa</TableCell>
                        <TableCell sx={{ width: 320 }}>Progresso</TableCell>
                        <TableCell align="right">Média quiz</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {modulos.map((m) => (
                        <ModuloRow key={m.id} modulo={m} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

function mapUsuarioAPIToFront(u: UsuarioProgressoAPI): UsuarioProgresso {
  return {
    id: u.id,
    nome: u.nome,
    concluido: u.concluido,
    progressoPercent: u.progresso_percent ?? 0,
    videoOk: u.video_ok,
    pdfOk: u.pdf_ok,
    quizOk: u.quiz_ok,
    scoreQuiz: u.score_quiz ?? undefined,
    ultimaAtividade: u.ultima_atividade ?? "-",
  };
}

function ModuloRow({ modulo }: { modulo: ModuloProgresso }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const rate = pct(modulo.concluidos, modulo.totalUsuarios);

  return (
    <>
      <TableRow hover sx={{ "& > *": { borderBottom: open ? "none" : undefined } }}>
        <TableCell width={52}>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </TableCell>

        <TableCell>
          <Typography fontWeight={900}>{modulo.titulo}</Typography>
          <Typography variant="body2" color="text.secondary">
            {modulo.totalUsuarios} usuários
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography fontWeight={900}>
            {modulo.concluidos}/{modulo.totalUsuarios}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Chip
            size="small"
            label={`${rate}%`}
            color={rate >= 70 ? "success" : rate >= 40 ? "warning" : "default"}
            sx={{ fontWeight: 800 }}
          />
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={rate}
                sx={{
                  height: 10,
                  borderRadius: 99,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,.08)"
                      : "rgba(2,6,23,.06)",
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 900, minWidth: 44, textAlign: "right" }}>
              {rate}%
            </Typography>
          </Stack>
        </TableCell>

        <TableCell align="right">
          <Typography fontWeight={900}>{modulo.mediaQuiz ?? 0}%</Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pt: 1.5 }}>
              <Typography fontWeight={900} sx={{ mb: 1 }}>
                Usuários
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell align="right">Progresso</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Última atividade</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {modulo.usuarios.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography fontWeight={900}>{u.nome}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {u.concluido ? "Concluído" : "Em andamento"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Typography fontWeight={900}>{u.progressoPercent}%</Typography>
                          <Box sx={{ width: 160 }}>
                            <LinearProgress
                              variant="determinate"
                              value={u.progressoPercent}
                              sx={{
                                height: 8,
                                borderRadius: 99,
                                bgcolor: "rgba(0,0,0,0.06)",
                              }}
                            />
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <StatusChipsRow u={u} />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {u.ultimaAtividade}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function StatusChipsRow({ u }: { u: UsuarioProgresso }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip size="small" label={u.videoOk ? "Vídeo ✓" : "Vídeo —"} color={u.videoOk ? "success" : "default"} />
      <Chip size="small" label={u.pdfOk ? "PDF ✓" : "PDF —"} color={u.pdfOk ? "success" : "default"} />
      <Chip
        size="small"
        label={u.quizOk ? `Quiz ✓ (${u.scoreQuiz ?? 0}%)` : "Quiz —"}
        color={u.quizOk ? "success" : "default"}
      />
    </Stack>
  );
}

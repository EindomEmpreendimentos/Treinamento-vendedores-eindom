import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Box,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";

import { listarModulos } from "../../services/treinamento";

import { metricasModulo, type ModuloMetricasAPI, type UsuarioProgressoAPI } from "../../services/dashboard";

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
  ultimaAtividade: string; // texto por enquanto
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
  if (d <= 0) return 0;
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
  return (
    <Card
      elevation={0}
      className="rounded-2xl"
      sx={{ border: "1px solid rgba(0,0,0,0.08)" }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={900}>
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
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(0,0,0,0.04)",
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
  const [modulos, setModulos] = useState<ModuloProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setErro(null);
      setLoading(true);
      try {
        // 1) lista módulos (para saber os ids)
        const lista = await listarModulos();

        // 2) para cada módulo, buscar métricas
        const metricasList: ModuloMetricasAPI[] = await Promise.all(
          lista.map((m: any) => metricasModulo(m.id))
        );

        // 3) mapear para o formato usado pelo dashboard
        const mapped: ModuloProgresso[] = metricasList.map((m) => ({
          id: m.modulo_id,
          titulo: m.titulo,
          totalUsuarios: m.total_usuarios,
          concluidos: m.concluidos,
          mediaQuiz: m.media_score_quiz, // 0..100
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
    if (modulos.length === 0) {
      return {
        totalModulos: 0,
        totalUsuarios: 0,
        taxaConclusao: 0,
        mediaQuizGeral: 0,
      };
    }

    const totalModulos = modulos.length;

    // usuários únicos (pela id)
    const uniqueUserIds = new Set<number>();
    modulos.forEach((m) => {
      m.usuarios.forEach((u) => uniqueUserIds.add(u.id));
    });
    const totalUsuarios = uniqueUserIds.size;

    const totalConcluidos = modulos.reduce((acc, m) => acc + m.concluidos, 0);
    const totalPossivel = modulos.reduce((acc, m) => acc + m.totalUsuarios, 0);
    const taxaConclusao = pct(totalConcluidos, totalPossivel);

    const mediaQuizGeral =
      modulos.length === 0
        ? 0
        : Math.round(
          modulos.reduce((acc, m) => acc + (m.mediaQuiz ?? 0), 0) / modulos.length
        );

    return { totalModulos, totalUsuarios, taxaConclusao, mediaQuizGeral };
  }, [modulos]);

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="h4" fontWeight={900}>
            Dashboard (Admin)
          </Typography>
          <Typography color="text.secondary">
            Acompanhe conclusão dos módulos e progresso por vendedor.
          </Typography>
        </div>
      </div>

      {erro && (
        <Alert severity="error" variant="outlined">
          {erro}
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <CircularProgress />
        </div>
      )}

      {!loading && (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

          {/* Progresso por módulo + drilldown por usuário */}
          <Card
            elevation={0}
            className="rounded-2xl"
            sx={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <CardContent className="grid gap-2">
              <Typography variant="h6" fontWeight={850}>
                Progresso por módulo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clique na seta para ver os usuários dentro do módulo.
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              {modulos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum módulo com métricas ainda.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={52} />
                      <TableCell>Módulo</TableCell>
                      <TableCell align="right">Concluídos</TableCell>
                      <TableCell align="right">Taxa</TableCell>
                      <TableCell>Métrica</TableCell>
                      <TableCell align="right">Média quiz</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {modulos.map((m) => (
                      <ModuloRow key={m.id} modulo={m} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function mapUsuarioAPIToFront(u: UsuarioProgressoAPI): UsuarioProgresso {
  return {
    id: u.id,
    nome: u.nome,
    concluido: u.concluido,
    progressoPercent: u.progresso_percent,
    videoOk: u.video_ok,
    pdfOk: u.pdf_ok,
    quizOk: u.quiz_ok,
    scoreQuiz: u.score_quiz ?? undefined,
    ultimaAtividade: u.ultima_atividade,
  };
}

function ModuloRow({ modulo }: { modulo: ModuloProgresso }) {
  const [open, setOpen] = useState(false);
  const rate = pct(modulo.concluidos, modulo.totalUsuarios);

  return (
    <>
      <TableRow hover>
        <TableCell width={52}>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
          </IconButton>
        </TableCell>

        <TableCell>
          <Typography fontWeight={800}>{modulo.titulo}</Typography>
          <Typography variant="body2" color="text.secondary">
            {modulo.totalUsuarios} usuários
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography fontWeight={800}>
            {modulo.concluidos}/{modulo.totalUsuarios}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Chip
            size="small"
            label={`${rate}%`}
            color={
              rate >= 70 ? "success" : rate >= 40 ? "warning" : "default"
            }
          />
        </TableCell>

        <TableCell>
          <Box sx={{ minWidth: 220 }}>
            <LinearProgress
              variant="determinate"
              value={rate}
              sx={{ height: 10, borderRadius: 99, bgcolor: "rgba(0,0,0,0.06)" }}
            />
          </Box>
        </TableCell>

        <TableCell align="right">
          <Typography fontWeight={800}>{modulo.mediaQuiz}%</Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2 }}>
              <Typography fontWeight={850} sx={{ mb: 1 }}>
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
                        <Typography fontWeight={800}>{u.nome}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {u.concluido ? "Concluído" : "Em andamento"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Typography fontWeight={800}>
                            {u.progressoPercent}%
                          </Typography>
                          <Box sx={{ width: 140 }}>
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
      <Chip
        size="small"
        label={u.videoOk ? "Vídeo ✓" : "Vídeo —"}
        color={u.videoOk ? "success" : "default"}
      />
      <Chip
        size="small"
        label={u.pdfOk ? "PDF ✓" : "PDF —"}
        color={u.pdfOk ? "success" : "default"}
      />
      <Chip
        size="small"
        label={u.quizOk ? `Quiz ✓ (${u.scoreQuiz ?? 0}%)` : "Quiz —"}
        color={u.quizOk ? "success" : "default"}
      />
    </Stack>
  );
}

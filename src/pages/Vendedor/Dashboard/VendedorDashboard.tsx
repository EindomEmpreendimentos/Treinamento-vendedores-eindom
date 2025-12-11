import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";

import { meusModulos, type MeusModulosItem } from "../../../services/treinamentoVendedor";
import Toast from "../../../utils/Toast";

export default function VendedorDashboard() {
  const [modulos, setModulos] = useState<MeusModulosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      setErro(null);
      setLoading(true);
      try {
        const data = await meusModulos();
        setModulos(data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.erro ||
          "Não foi possível carregar seus módulos.";
        setErro(msg);
        Toast.erro(msg);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return (
    <div className="grid gap-5">
      <div>
        <Typography variant="h4" fontWeight={900}>
          Meus treinamentos
        </Typography>
        <Typography color="text.secondary">
          Veja seus módulos, acompanhe o progresso e finalize os quizzes.
        </Typography>
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

      {!loading && modulos.length === 0 && (
        <Card elevation={0} className="rounded-2xl" sx={{ border: "1px dashed rgba(0,0,0,0.18)" }}>
          <CardContent sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={900}>
              Nenhum treinamento disponível
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Assim que novos módulos forem liberados, eles aparecem aqui.
            </Typography>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {modulos.map((m) => (
          <Card
            key={m.id}
            elevation={0}
            className="rounded-2xl"
            sx={{
              border: "1px solid rgba(0,0,0,0.08)",
              transition: "transform .12s ease, box-shadow .12s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Typography variant="h6" fontWeight={900}>
                    {m.titulo}
                  </Typography>
                  {m.descricao && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                      className="line-clamp-2"
                    >
                      {m.descricao}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      icon={m.concluido ? <CheckCircleRoundedIcon /> : <PlayCircleFilledRoundedIcon />}
                      label={m.concluido ? "Concluído" : "Em andamento"}
                      color={m.concluido ? "success" : "primary"}
                      variant={m.concluido ? "filled" : "outlined"}
                    />
                    {m.video_ok && <Chip size="small" label="Vídeo ok" color="success" variant="outlined" />}
                    {m.pdf_ok && <Chip size="small" label="PDF ok" color="success" variant="outlined" />}
                    {m.quiz_ok && (
                      <Chip
                        size="small"
                        label={`Quiz ok (${m.score_quiz ?? 0}%)`}
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </div>

                <Button
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
                  onClick={() => navigate(`/treinamentos/modulos/${m.id}`)}
                >
                  {m.concluido ? "Revisar módulo" : "Continuar módulo"}
                </Button>
              </div>

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {m.progresso_percent}%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={m.progresso_percent}
                  sx={{ mt: 0.5, height: 8, borderRadius: 99, bgcolor: "rgba(0,0,0,0.06)" }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

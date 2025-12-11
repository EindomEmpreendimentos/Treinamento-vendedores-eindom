import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Toast from "../../utils/Toast";
import { useAutenticacao } from "@contextos/autentiacaoContext";

export default function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const { login } = useAutenticacao();

  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) return Toast.erro("Digite seu usuário");
    if (senha.trim().length < 4) return Toast.erro("Senha muito curta");

    setLoading(true);
    try {
      await login({ username: username.trim(), password: senha });

      Toast.mensagem("Login realizado ✅");

      const to = location?.state?.from ?? "/admin";
      navigate(to, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Não foi possível entrar. Verifique suas credenciais.";
      Toast.erro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(900px circle at 20% 10%, rgba(237, 204, 58, 0.2), transparent 40%), radial-gradient(900px circle at 80% 70%, rgba(56,189,248,.15), transparent 40%), #0b1020"
            : "radial-gradient(900px circle at 20% 10%, rgba(124,58,237,.15), transparent 40%), radial-gradient(900px circle at 80% 70%, rgba(56,189,248,.12), transparent 40%), #f8fafc",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 4,
          overflow: "hidden",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,.10)"
              : "1px solid rgba(2,6,23,.08)",
          backdropFilter: "blur(10px)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(15,23,42,.70)"
              : "rgba(255,255,255,.75)",
        }}
      >
        <Box
          sx={{
            p: 3,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(124,58,237,.25), rgba(56,189,248,.15))"
                : "linear-gradient(135deg, rgba(124,58,237,.14), rgba(56,189,248,.10))",
          }}
        >
          <Typography variant="h5" fontWeight={900}>
            Treinamento Eindom Empreendimentos
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Faça login para continuar.
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              fullWidth
              disabled={loading}
            />

            <TextField
              label="Senha"
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              fullWidth
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setMostrarSenha((s) => !s)}
                      edge="end"
                      aria-label="mostrar senha"
                      disabled={loading}
                    >
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Lembrar de mim"
              />

              <Typography
                component={Link}
                to="/forgot-password"
                sx={{ textDecoration: "none", fontWeight: 800, color: "primary.main" }}
              >
                Esqueci minha senha
              </Typography>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 3, py: 1.2, fontWeight: 900 }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* <Divider />

            <Button
              variant="outlined"
              onClick={() => {
                Toast.informacao("Modo demo: preenchendo credenciais ✨");
                setUsername("demo");
                setSenha("1234");
              }}
              disabled={loading}
              sx={{ borderRadius: 3, py: 1.1, fontWeight: 900 }}
            >
              Preencher demo
            </Button> */}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

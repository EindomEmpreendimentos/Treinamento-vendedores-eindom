import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Toast from "../../utils/Toast";


export default function ResetPassword() {
  const theme = useTheme();
  const navigate = useNavigate();

  const storedEmail = localStorage.getItem("mock:reset_email") || "";
  const storedToken = localStorage.getItem("mock:reset_token") || "";

  const [email, setEmail] = useState(storedEmail);
  const [token, setToken] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const passOk = useMemo(() => pass.trim().length >= 6, [pass]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOk) return Toast.erro("E-mail inválido");
    if (!token.trim()) return Toast.erro("Informe o token");
    if (!passOk) return Toast.erro("A senha precisa ter no mínimo 6 caracteres");
    if (pass !== pass2) return Toast.erro("As senhas não conferem");

    if (!storedToken) return Toast.erro("Você ainda não gerou um token (vá em Esqueci minha senha).");
    if (token.trim().toUpperCase() !== storedToken.toUpperCase()) return Toast.erro("Token inválido (mock)");

    setLoading(true);
    try {
      // MOCK (sem backend)
      await new Promise((r) => setTimeout(r, 600));

      localStorage.removeItem("mock:reset_token");
      localStorage.removeItem("mock:reset_email");

      Toast.mensagem("Senha redefinida (mock) ✅");
      navigate("/login");
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
            ? "radial-gradient(900px circle at 10% 20%, rgba(56,189,248,.16), transparent 40%), radial-gradient(900px circle at 90% 70%, rgba(34,197,94,.12), transparent 40%), #0b1020"
            : "radial-gradient(900px circle at 10% 20%, rgba(56,189,248,.12), transparent 40%), radial-gradient(900px circle at 90% 70%, rgba(34,197,94,.10), transparent 40%), #f8fafc",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          p: 3,
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,.10)"
              : "1px solid rgba(2,6,23,.08)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(15,23,42,.70)"
              : "rgba(255,255,255,.75)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={900}>
            Redefinir senha ✨
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Cole o token e escolha uma nova senha (mock, sem backend).
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <TextField
              label="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              fullWidth
              helperText={
                storedToken
                  ? "Dica: token foi gerado na tela anterior (mock)."
                  : "Gere um token em 'Esqueci minha senha'."
              }
            />

            <Divider />

            <TextField
              label="Nova senha"
              type={show1 ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow1((v) => !v)} edge="end">
                      {show1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirmar nova senha"
              type={show2 ? "text" : "password"}
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow2((v) => !v)} edge="end">
                      {show2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 3, py: 1.2, fontWeight: 900 }}
            >
              {loading ? "Salvando..." : "Redefinir senha"}
            </Button>

            <Stack direction="row" justifyContent="space-between">
              <Typography
                component={Link}
                to="/forgot-password"
                sx={{ textDecoration: "none", fontWeight: 800, color: "primary.main" }}
              >
                Gerar token
              </Typography>

              <Typography
                component={Link}
                to="/login"
                sx={{ textDecoration: "none", fontWeight: 800, color: "primary.main" }}
              >
                Voltar pro login
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

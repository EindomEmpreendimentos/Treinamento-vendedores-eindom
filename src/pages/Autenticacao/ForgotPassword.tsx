import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, Paper, Stack, TextField, Typography, useTheme } from "@mui/material";
import Toast from "../../utils/Toast";


function genToken(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function ForgotPassword() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk) return Toast.erro("Digite um e-mail válido");

    setLoading(true);
    try {
      // MOCK (sem backend)
      await new Promise((r) => setTimeout(r, 600));

      const token = genToken(6);
      localStorage.setItem("mock:reset_email", email.trim());
      localStorage.setItem("mock:reset_token", token);

      Toast.mensagem("Pedido de recuperação criado ✅");
      Toast.informacao(`Token mock (pra teste): ${token}`);

      navigate("/reset-password");
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
            ? "radial-gradient(900px circle at 20% 10%, rgba(236,72,153,.15), transparent 40%), radial-gradient(900px circle at 80% 70%, rgba(124,58,237,.18), transparent 40%), #0b1020"
            : "radial-gradient(900px circle at 20% 10%, rgba(236,72,153,.10), transparent 40%), radial-gradient(900px circle at 80% 70%, rgba(124,58,237,.12), transparent 40%), #f8fafc",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
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
            Esqueci minha senha 🔐
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Digite seu e-mail e vamos gerar um token de redefinição (mock, sem backend).
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Seu e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 3, py: 1.2, fontWeight: 900 }}
            >
              {loading ? "Enviando..." : "Enviar token"}
            </Button>

            <Stack direction="row" justifyContent="space-between">
              <Typography
                component={Link}
                to="/login"
                sx={{ textDecoration: "none", fontWeight: 800, color: "primary.main" }}
              >
                Voltar pro login
              </Typography>

              <Typography
                component={Link}
                to="/reset-password"
                sx={{ textDecoration: "none", fontWeight: 800, color: "primary.main" }}
              >
                Já tenho token
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

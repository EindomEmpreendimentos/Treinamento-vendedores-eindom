import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Toast from "../../utils/Toast";
import { useAutenticacao } from "@contextos/autentiacaoContext";
import AuthLayout from "../../layouts/AuthLayout";

export default function Login() {
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
    <AuthLayout
      subtitle="Faça login para continuar."
    >
      <form onSubmit={onSubmit}>
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
        </Stack>
      </form>
    </AuthLayout>
  );
}

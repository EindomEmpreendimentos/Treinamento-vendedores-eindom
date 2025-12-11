import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import Toast from "../../utils/Toast";


import { criarVendedor } from "../../services/usuarios";
import { useNavigate } from "react-router-dom";

export default function VendedorCreate() {
  const navigate = useNavigate();
  const [showSenha, setShowSenha] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    celular: "",
    cpf: "",
    cnpj: "",
    cargo: "",
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const nomeCompleto = [form.first_name, form.last_name].filter(Boolean).join(" ");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setErro("Preencha pelo menos username, e-mail e senha.");
      Toast.erro("Campos obrigatórios faltando.");
      return;
    }

    setSaving(true);
    try {
      await criarVendedor({
        ...form,
      });
      Toast.mensagem("Vendedor cadastrado com sucesso ✅");
      navigate("/admin/vendedores", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.erro ||
        err?.response?.data?.username?.[0] ||
        err?.response?.data?.email?.[0] ||
        "Não foi possível cadastrar o vendedor.";
      setErro(msg);
      Toast.erro(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Typography variant="h4" fontWeight={900}>
            Cadastrar novo vendedor
          </Typography>
          <Typography color="text.secondary">
            Crie o usuário que vai acessar os treinamentos. A senha definida aqui será
            compartilhada manualmente com o vendedor.
          </Typography>
        </div>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={saving}
            sx={{ borderRadius: 3 }}
          >
            {saving ? "Salvando..." : "Salvar vendedor"}
          </Button>
        </Stack>
      </div>

      {erro && (
        <Alert severity="error" variant="outlined">
          {erro}
        </Alert>
      )}

      <Card elevation={0} className="rounded-2xl">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome"
                fullWidth
                value={form.first_name}
                onChange={handleChange("first_name")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Sobrenome"
                fullWidth
                value={form.last_name}
                onChange={handleChange("last_name")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Username (login)"
                fullWidth
                required
                value={form.username}
                onChange={handleChange("username")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={handleChange("email")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Senha"
                fullWidth
                required
                type={showSenha ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowSenha((s) => !s)} edge="end">
                        {showSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Cargo"
                fullWidth
                value={form.cargo}
                onChange={handleChange("cargo")}
                placeholder="Ex: Vendedor externo"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Celular"
                fullWidth
                value={form.celular}
                onChange={handleChange("celular")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="CPF" fullWidth value={form.cpf} onChange={handleChange("cpf")} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="CNPJ" fullWidth value={form.cnpj} onChange={handleChange("cnpj")} />
            </Grid>
          </Grid>

          {nomeCompleto && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Esse vendedor verá o nome como: <strong>{nomeCompleto}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

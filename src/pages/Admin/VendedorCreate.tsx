import { useMemo, useState } from "react";
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
  Divider,
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

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const nomeCompleto = useMemo(
    () => [form.first_name, form.last_name].filter(Boolean).join(" "),
    [form.first_name, form.last_name]
  );

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
      await criarVendedor({ ...form });
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
    <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2.5 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ minWidth: 260 }}>
          <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.1 }}>
            Cadastrar novo vendedor
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Crie o usuário que vai acessar os treinamentos. A senha definida aqui será
            compartilhada manualmente com o vendedor.
          </Typography>
          {nomeCompleto && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Nome exibido: <strong>{nomeCompleto}</strong>
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(-1)}
            disabled={saving}
            sx={{ borderRadius: 2 }}
          >
            Voltar
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={saving}
            sx={{ borderRadius: 2 }}
          >
            {saving ? "Salvando..." : "Salvar vendedor"}
          </Button>
        </Stack>
      </Box>

      {erro && (
        <Alert severity="error" variant="outlined">
          {erro}
        </Alert>
      )}

      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Seção: Dados pessoais */}
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            Dados pessoais
          </Typography>

          <Grid container spacing={2}>
            <Grid>
              <TextField
                label="Nome"
                fullWidth
                value={form.first_name}
                onChange={handleChange("first_name")}
              />
            </Grid>

            <Grid>
              <TextField
                label="Sobrenome"
                fullWidth
                value={form.last_name}
                onChange={handleChange("last_name")}
              />
            </Grid>

            <Grid>
              <TextField
                label="Cargo"
                fullWidth
                value={form.cargo}
                onChange={handleChange("cargo")}
                placeholder="Ex: Vendedor externo"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Seção: Acesso */}
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            Acesso
          </Typography>

          <Grid container spacing={2}>
            <Grid>
              <TextField
                label="Username (login)"
                fullWidth
                required
                value={form.username}
                onChange={handleChange("username")}
              />
            </Grid>

            <Grid>
              <TextField
                label="E-mail"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={handleChange("email")}
              />
            </Grid>

            <Grid>
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
                      <IconButton
                        onClick={() => setShowSenha((s) => !s)}
                        edge="end"
                        aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                helperText="Compartilhe essa senha manualmente com o vendedor."
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Seção: Contato & documentos */}
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            Contato & documentos
          </Typography>

          <Grid container spacing={2}>
            <Grid>
              <TextField
                label="Celular"
                fullWidth
                value={form.celular}
                onChange={handleChange("celular")}
              />
            </Grid>

            <Grid>
              <TextField
                label="CPF"
                fullWidth
                value={form.cpf}
                onChange={handleChange("cpf")}
              />
            </Grid>

            <Grid>
              <TextField
                label="CNPJ"
                fullWidth
                value={form.cnpj}
                onChange={handleChange("cnpj")}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

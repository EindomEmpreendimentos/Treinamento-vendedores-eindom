import { AppBar, Toolbar, Typography, Box, IconButton, Avatar } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAutenticacao } from "../../contextos/autentiacaoContext";

export default function AdminHeader() {
  const { logout } = useAutenticacao();

  return (
    <AppBar position="fixed" elevation={0} color="default">
      <Toolbar sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin • Treinamentos
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
          <IconButton aria-label="sair" onClick={logout}>
            <LogoutRoundedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

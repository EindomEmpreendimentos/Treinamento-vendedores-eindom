import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Button,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { NavLink } from "react-router-dom";

import { useAutenticacao } from "@contextos/autentiacaoContext";

const DRAWER_WIDTH = 280;

const itemButtonSx = {
  borderRadius: 2,
  "&.Mui-selected": {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.02)",
  },
};

export default function AdminSidebar() {
  const { usuario, logout } = useAutenticacao();

  const initials =
    usuario?.fullname?.trim()?.split(" ")?.map((p: string) => p[0])?.slice(0, 2).join("") ||
    usuario?.username?.[0]?.toUpperCase() ||
    "A";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "white",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Cabeçalho (igual o do vendedor) */}
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Typography variant="subtitle2" color="text.secondary">
            Admin • Treinamentos
          </Typography>
          <Typography variant="h6" fontWeight={900}>
            Village Itaparica
          </Typography>
        </Box>

        {/* Menu */}
        <List sx={{ px: 1.5, py: 1.5, flex: 1 }}>
          {/* DASHBOARD - match exato */}
          <NavLink
            to="/admin"
            end
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {({ isActive }) => (
              <ListItemButton selected={isActive} sx={itemButtonSx}>
                <ListItemIcon>
                  <DashboardRoundedIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            )}
          </NavLink>

          {/* MÓDULOS */}
          <NavLink
            to="/admin/modulos"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {({ isActive }) => (
              <ListItemButton selected={isActive} sx={{ ...itemButtonSx, mt: 1 }}>
                <ListItemIcon>
                  <ViewModuleRoundedIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Módulos"
                  secondary="Vídeos, PDFs e Quizzes"
                />
              </ListItemButton>
            )}
          </NavLink>

          {/* CADASTRAR VENDEDOR */}
          <NavLink
            to="/admin/vendedores/novo"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {({ isActive }) => (
              <ListItemButton selected={isActive} sx={{ ...itemButtonSx, mt: 1 }}>
                <ListItemIcon>
                  <PersonAddAltRoundedIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Novo vendedor"
                  secondary="Cadastrar acesso"
                />
              </ListItemButton>
            )}
          </NavLink>
        </List>

        {/* Bloco de usuário + sair (igual vendedor) */}
        <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Avatar sx={{ width: 36, height: 36 }}>{initials}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {usuario?.fullname || usuario?.username || "Administrador"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {usuario?.email}
              </Typography>
            </Box>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<LogoutRoundedIcon />}
            sx={{ borderRadius: 999 }}
            onClick={logout}
          >
            Sair
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

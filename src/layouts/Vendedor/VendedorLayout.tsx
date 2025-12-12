// src/components/Treinamentos/TreinamentosLayout.tsx
import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

import { useAutenticacao } from "@contextos/autentiacaoContext";

const DRAWER_WIDTH = 260;

export default function VendedorLayout() {
  const { usuario, logout } = useAutenticacao();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    usuario?.fullname?.trim()?.split(" ")?.map((p: string) => p[0])?.slice(0, 2).join("") ||
    usuario?.username?.[0]?.toUpperCase() ||
    "U";

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Typography variant="subtitle2" color="text.secondary">
          Treinamentos
        </Typography>
        <Typography variant="h6" fontWeight={900}>
          Village Itaparica
        </Typography>
      </Box>

      <List sx={{ p: 1.5, flex: 1 }}>
        {/* Link principal do vendedor */}
        <NavLink
          to="/treinamentos"
          end
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {({ isActive }) => (
            <ListItemButton
              selected={isActive}
              sx={{
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
              }}
            >
              <ListItemIcon>
                <SchoolRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Meus treinamentos"
                secondary="Módulos e progresso"
              />
            </ListItemButton>
          )}
        </NavLink>

        {/* futuro: histórico / certificados */}
        {/*
        <NavLink
          to="/treinamentos/historico"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {({ isActive }) => (
            <ListItemButton
              selected={isActive}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,0,0,0.06)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "rgba(0,0,0,0.08)",
                },
              }}
            >
              <ListItemIcon>
                <HistoryRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Histórico"
                secondary="Tentativas e certificados"
              />
            </ListItemButton>
          )}
        </NavLink>
        */}
      </List>

      <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 36, height: 36 }}>{initials}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {usuario?.fullname || usuario?.username || "Vendedor"}
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
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor:
          theme.palette.mode === "dark" ? "#020617" : "#f3f4f6",
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              edge="start"
              sx={{ display: { md: "none" } }}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <MenuRoundedIcon />
            </IconButton>
            <DashboardRoundedIcon fontSize="small" />
            <Typography variant="h6" fontWeight={900}>
              Meus treinamentos
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              {usuario?.fullname || usuario?.username}
            </Typography>
            <Avatar sx={{ width: 32, height: 32 }}>{initials}</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Sidebar mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Conteúdo */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

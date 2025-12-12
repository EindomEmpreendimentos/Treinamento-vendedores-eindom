import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <AdminSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0, // MUITO importante pra evitar overflow em flex
        }}
      >
        <Toolbar />

        {/* Em vez de Container lg: um wrapper full width */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 1,
            maxWidth: "1400px",   // opcional: controla “esparramo” em telas gigantes
            width: "100%",
            mx: "auto",           // centraliza o conteúdo quando tiver maxWidth
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

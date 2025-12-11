import { Outlet } from "react-router-dom";
import { Box, Toolbar, Container } from "@mui/material";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f7fb" }}>
      <AdminHeader />
      <AdminSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '20px',
          width: `calc(100% - 20}px)`,
        }}
      >
        {/* spacer exato da altura do AppBar */}
        <Toolbar />

        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

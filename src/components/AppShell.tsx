import { Outlet, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="sticky" elevation={0}>
        <Toolbar className="flex gap-3">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Nova Plataforma
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-6">
        <Outlet />
      </Container>
    </div>
  );
}

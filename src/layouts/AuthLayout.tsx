import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import capa from "../assets/capa-village-treinamento.jpg";
import logoEindom from "../assets/logoeindom2.png";

type AuthLayoutProps = {
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: number;
};

export default function AuthLayout({
  subtitle,
  children,
  maxWidth = 450,
}: AuthLayoutProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        position: "relative",
        overflow: "hidden",

        // Imagem de fundo
        backgroundImage: `url(${capa})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay leve (remove o "branco" estourado, mas mantém contraste) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.18)", // ajuste: 0.10 a 0.30
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth,
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255,255,255,.10)"
              : "1px solid rgba(2,6,23,.08)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(15,23,42,.70)"
              : "rgba(255,255,255,.88)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 18px 50px rgba(0,0,0,.18)",
        }}
      >
        {/* Header: logo + subtitle centralizados (sem fundo/gradiente) */}
        <Box
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "transparent",
          }}
        >
          <Box
            component="img"
            src={logoEindom}
            alt="Logo Eindom"
            sx={{
              height: 200,
              width: "auto",
              objectFit: "contain",
            }}
          />

          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                fontWeight: 700,
                mb:2,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ p: 3, pt: 0 }}>{children}</Box>
      </Paper>
    </Box>
  );
}

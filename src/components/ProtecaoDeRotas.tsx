import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import { useAutenticacao } from "@contextos/autentiacaoContext";
export const ProtecaoDeRotas = ({ element }: { element: ReactElement }) => {
  const { autenticado } = useAutenticacao();

  if (!autenticado) {
    return <Navigate to="/" state={{ from: window.location.pathname }} replace />;
  }

  return element;
};

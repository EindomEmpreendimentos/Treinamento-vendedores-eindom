import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacao } from "@contextos/autentiacaoContext";
import type { ReactElement } from "react";

type Props = { element: ReactElement };

export function SomenteAdminTreinamento({ element }: Props) {
  const { usuario } = useAutenticacao();
  const location = useLocation();

  if (!usuario?.is_treinamento_admin) {
    return (
      <Navigate
        to="/treinamentos"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return element;
}

export function SomenteVendedorTreinamento({ element }: Props) {
  const { usuario } = useAutenticacao();
  const location = useLocation();

  if (!usuario?.is_treinamento_vendedor) {
    // se não for vendedor, manda pro admin se for admin, ou pra home
    if (usuario?.is_treinamento_admin) {
      return <Navigate to="/admin" replace />;
    }
    return (
      <Navigate
        to="/"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return element;
}

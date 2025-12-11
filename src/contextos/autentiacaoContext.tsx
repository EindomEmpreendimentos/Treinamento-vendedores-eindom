import React, { createContext, useEffect, useMemo, useState, useContext } from "react";
import { api } from "../api/http";
type Usuario = Record<string, any>; // Fazer o tipo certo

type LoginPayload = {
  username: string;
  password: string;
};

type AutenticacaoContextValue = {
  autenticado: boolean;
  usuario: Usuario | null;
  login: (payload: LoginPayload) => Promise<Usuario>;
  logout: () => void;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>;
};

export const AutenticacaoContext = createContext<AutenticacaoContextValue | null>(null);

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const autenticado = useMemo(() => !!localStorage.getItem("access"), [usuario]);

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem("usuario");
    if (usuarioArmazenado) setUsuario(JSON.parse(usuarioArmazenado));
  }, []);

  async function login(payload: LoginPayload) {
    const { data } = await api.post("/auth/token/", {
      username: payload.username,
      password: payload.password,
    });

    localStorage.setItem("access", data.access);
    if (data.refresh) localStorage.setItem("refresh", data.refresh);

    const me = await api.get("/auth/usuarios/");
    localStorage.setItem("usuario", JSON.stringify(me.data));
    setUsuario(me.data);

    return me.data;
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  const value: AutenticacaoContextValue = {
    autenticado: autenticado,
    usuario,
    login,
    logout,
    setUsuario,
  };

  return <AutenticacaoContext.Provider value={value}>{children}</AutenticacaoContext.Provider>;
}

export function useAutenticacao() {
  const ctx = useContext(AutenticacaoContext);
  if (!ctx) throw new Error("useAutenticacao deve ser usado dentro de <AutenticacaoProvider>");
  return ctx;
}

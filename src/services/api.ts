import { api } from "./auth";

export async function loginApi(email: string, password: string) {
  // seu backend: /auth/token/
  const { data } = await api.post("/auth/token/", { email, password });
  // data deve conter { access, refresh }
  return data as { access: string; refresh: string };
}

export async function meApi() {
  // seu backend: /auth/usuarios/ (retorna dados completos do usuário logado)
  const { data } = await api.get("/auth/usuarios/");
  return data;
}

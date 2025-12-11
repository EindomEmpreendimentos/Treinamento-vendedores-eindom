import { api } from "./auth";

export type NovoVendedorPayload = {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  celular?: string;
  cpf?: string;
  cnpj?: string;
  cargo?: string;
  area_atuacao?: number | null;
  superior_id?: number | null;
};

export async function criarVendedor(payload: NovoVendedorPayload) {
  const { data } = await api.post("/auth/usuarios/vendedores/", payload);
  return data;
}

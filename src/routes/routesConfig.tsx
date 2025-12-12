import { lazy } from "react";
import type { ReactElement } from "react";
import type { RouteObject } from "react-router-dom";

import AdminLayout from "../layouts/Admin/AdminLayout";
import VendedorLayout from "../layouts/Vendedor/VendedorLayout";

import {
  SomenteAdminTreinamento,
  SomenteVendedorTreinamento,
} from "../components/ProtecaoDeRotasTreinamento";

// Autenticação
const Login = lazy(() => import("@pages/Autenticacao/Login"));
const ForgotPassword = lazy(() => import("@pages/Autenticacao/ForgotPassword"));
const ResetPassword = lazy(() => import("@pages/Autenticacao/ResetPassword"));


// Admin treinamentos
const AdminDashboard = lazy(() => import("@pages/Admin/AdminDashboard"));
const ModulosList = lazy(() => import("@pages/Admin/Modulos/ModulosList"));
const ModuloCreate = lazy(() => import("@pages/Admin/Modulos/ModuloCreate"));
const ModuloEdit = lazy(() => import("@pages/Admin/Modulos/ModuloEdit"));
const ModuloPreview = lazy(() => import("@pages/Admin/Modulos/ModuloPreview"));
const VendedorCreate = lazy(() => import("@pages/Admin/VendedorCreate"));

// Vendedor treinamentos
const VendedorDashboard = lazy(
  () => import("@pages/Vendedor/Dashboard/VendedorDashboard")
);
const VendedorModuloPage = lazy(
  () => import("@pages/Vendedor/Modulo/VendedorModuloPage")
);

export type RotaConfig = Omit<RouteObject, "element" | "children"> & {
  element?: ReactElement;
  children?: RotaConfig[];
  protegido?: boolean;
  setorPermitido?: number;
};

export const Rotas: RotaConfig[] = [
  // público
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },


  {
    path: "/admin",
    protegido: true,
    element: (
      <SomenteAdminTreinamento element={<AdminLayout />} />
    ),
    children: [
      // /admin
      { index: true, element: <AdminDashboard /> },

      // /admin/modulos
      { path: "modulos", element: <ModulosList /> },

      // /admin/modulos/novo
      { path: "modulos/novo", element: <ModuloCreate /> },

      // /admin/modulos/:id/editar
      { path: "modulos/:id/editar", element: <ModuloEdit /> },

      // /admin/modulos/:id/preview
      {
        path: "modulos/:id/preview", // sem /admin/ aqui, pois é filho
        element: <ModuloPreview />,
      },
      {
        path: "/admin/vendedores/novo", element:<VendedorCreate/>,
      },
    ],
  },

  // ===================== VENDEDOR TREINAMENTOS =====================
  {
    path: "/treinamentos",
    protegido: true,
    element: (
      <SomenteVendedorTreinamento element={<VendedorLayout />} />
    ),
    children: [
      // /treinamentos
      { index: true, element: <VendedorDashboard /> },

      // /treinamentos/modulos/:id
      { path: "modulos/:id", element: <VendedorModuloPage /> },
    ],
  },
];

import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Autenticacao/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import AppShell from "../components/AppShell";

export const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <Dashboard /> }],
    },
]);

import { Suspense } from "react";
import  { ToastContainer } from "react-toastify";

import AppRouter from "./Routes";
import { CarregamentoFallbackSuspense } from "./CarregamentoFallbackSuspense";
import { AutenticacaoProvider } from "@contextos/autentiacaoContext";
export default function TreinamentoEindom() {
  return (
    <Suspense fallback={<CarregamentoFallbackSuspense />}>
      <AutenticacaoProvider>
        <AppRouter />
        <ToastContainer />
      </AutenticacaoProvider>
    </Suspense>
  );
}

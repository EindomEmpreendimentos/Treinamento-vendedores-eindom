import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ProtecaoDeRotas } from "./components/ProtecaoDeRotas";
import { Rotas } from "@routes/routesConfig";

class AppRouter extends React.Component {
  #configuracoesDeRotas = { v7_startTransition: true };
  rotas: any[];

  constructor(props: object) {
    super(props);
    this.rotas = this.#processarRotas();
  }

  #construirRotas() {
    return createBrowserRouter(this.rotas);
  }

  #processarRotas() {
    return Rotas.map((rota) => {
      let elemento = rota.element;

      if (rota.protegido) {

        elemento = <ProtecaoDeRotas element={elemento} />;
      }

      return { ...rota, element: elemento };
    });
  }

  render() {
    return (
      <RouterProvider
        router={this.#construirRotas()}
        future={this.#configuracoesDeRotas}
      />
    );
  }
}

export default AppRouter;

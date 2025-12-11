import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ProtecaoDeRotas } from "./components/ProtecaoDeRotas";
import { Rotas } from "@routes/routesConfig";

class AppRouter extends React.Component {
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

      if (rota.protegido && elemento) {

        elemento = <ProtecaoDeRotas element={elemento} />;
      }

      return { ...rota, element: elemento };
    });
  }

  render() {
    return (
      <RouterProvider
        router={this.#construirRotas()}
      />
    );
  }
}

export default AppRouter;

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "../HomePage";
import "@testing-library/jest-dom";

test("affiche le contenu de la page d'accueil", () => {
  render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

  expect(screen.getByText(/Bienvenue sur ChefBOT/i)).toBeInTheDocument();
  expect(screen.getByText(/Se connecter/i)).toBeInTheDocument();
  expect(screen.getByText(/S’inscrire/i)).toBeInTheDocument();
});

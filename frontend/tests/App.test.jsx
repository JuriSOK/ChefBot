import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../App";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

describe("App", () => {
  test("affiche le contenu de la HomePage", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Vérifie si le titre de la HomePage s'affiche bien
    const titleElement = screen.getByText(/Bienvenue sur ChefBOT/i);
    expect(titleElement).toBeInTheDocument();
  });
});

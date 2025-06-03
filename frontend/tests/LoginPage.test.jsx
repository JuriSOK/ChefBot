import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "../LoginPage";
import "@testing-library/jest-dom";

describe("LoginPage", () => {
  test("affiche les éléments de la page de connexion", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // tester le logo
    const logo = screen.getByAltText("ChefBot");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.png");

    //vérification des champs du formulaire
    expect(screen.getByPlaceholderText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mot de passe/i)).toBeInTheDocument();

    //vérification du button "Me connecter"
    expect(screen.getByRole("button", { name: /me connecter/i })).toBeInTheDocument();

    //vérification du lien mot de passe oublié
    expect(screen.getByText(/Mot de passe oublié/i)).toBeInTheDocument();

    //vérification du lien vers l'inscription
    expect(screen.getByText(/Inscription ici/i)).toBeInTheDocument();
  });
});

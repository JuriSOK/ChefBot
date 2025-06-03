import React from "react";
import { render, screen } from "@testing-library/react";
import SignupPage from "../SignupPage";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Groupe de tests pour la page Signup
describe("SignupPage", () => {
  
  // Test 1 - Vérifie que le titre est affiché
  test("affiche le titre de la page", () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    const titleElement = screen.getByText("Créer un compte");
    expect(titleElement).toBeInTheDocument();
  });

  // Test 2 - Vérifie que le bouton de création de compte est présent
  test("affiche le bouton de création de compte", () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    const buttonElement = screen.getByText("Créer mon compte");
    expect(buttonElement).toBeInTheDocument();
  });

  // Test 3 - Vérifie la présence du champ email ou téléphone
  test("affiche le champ email / téléphone", () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText("E-mail / Numéro de téléphone");
    expect(emailInput).toBeInTheDocument();
  });

  // ✅ Test 4 - Vérifie que le logo est bien affiché
  test("affiche le logo", () => {
    render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );

    // Vérifie avec le alt correct : "ChefBot"
    const logo = screen.getByAltText("ChefBot"); 
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.png");
  });

});

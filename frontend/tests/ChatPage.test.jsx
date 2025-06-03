import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatPage from "../ChatPage";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

describe("ChatPage", () => {
  test("affiche le message par défaut quand il n'y a aucun message", () => {
    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    const defaultText = screen.getByText(
      /Je ne brûle jamais un plat sauf si vous me le demandez/i
    );
    expect(defaultText).toBeInTheDocument();
  });

  test("envoie un message et affiche la réponse du bot", () => {
    render(
      <BrowserRouter>
        <ChatPage />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(/Que voulez-vous cuisiner/i);
    const sendButton = screen.getByRole("button", { name: "📩" });

    //essayer l'écriture d'un message
    fireEvent.change(input, { target: { value: "Je veux faire un couscous" } });

    // essayer le clic sur le bouton d'envoi
    fireEvent.click(sendButton);

    //vérifie si le message utilisateur s'affiche
    expect(screen.getByText("Je veux faire un couscous")).toBeInTheDocument();

    //vérifie si la réponse du bot s'affiche
    expect(
      screen.getByText(/Voilà une idée de recette/i)
    ).toBeInTheDocument();
  });
});

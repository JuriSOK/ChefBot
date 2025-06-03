
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProfilePage from "../ProfilePage";
import "@testing-library/jest-dom";

describe("ProfilePage", () => {
  test("affiche le titre Profil utilisateur dans la sidebar", () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    const title = screen.getByText("Profil utilisateur");
    expect(title).toBeInTheDocument();
  });
});

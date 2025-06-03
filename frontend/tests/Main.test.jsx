import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../HomePage"; 
import "@testing-library/jest-dom";


describe("Routing test", () => {
  test("affiche la HomePage à la racine (/)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>
    );

    const titleElement = screen.getByText(/Bienvenue sur ChefBOT/i);
    expect(titleElement).toBeInTheDocument();
  });

  
});


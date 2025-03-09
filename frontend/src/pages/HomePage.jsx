import "./HomePage.css";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate(); 


  return (
    <div className="homepage-container">
      <img 
        src="/chef.png" 
        alt="ChefBOT" 
        className="homepage-image"
      />
      <h1 className="homepage-title">
        Bienvenue sur ChefBOT !
      </h1>
      <p className="homepage-text">
        Discutez avec votre assistant culinaire intelligent et découvrez de délicieuses recettes
      </p>
      <div className="homepage-buttons">
        <button 
          className="homepage-button"
          onClick={() => navigate("/login")} 
        > 
          Se connecter
        </button>
        <button className="homepage-button" onClick={() => navigate("/signup")}>
          S’inscrire
        </button>

      </div>
    </div>
  );
}

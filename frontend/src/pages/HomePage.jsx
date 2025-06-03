import React from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AccessibilityButtons from "./AccessibilityButtons";


export default function HomePage() {
  const navigate = useNavigate();

  return (

    <>
    <AccessibilityButtons />
  
    <div className="homepage-container">
      <motion.img
        src="/chef.png"
        alt="ChefBOT"
        className="homepage-image"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
      <h1 className="homepage-title">Bienvenue sur ChefBOT !</h1>
      <p className="homepage-text">
        Votre assistant culinaire intelligent pour des recettes personnalisées, faciles et savoureuses 🍽️
      </p>

      <div className="homepage-buttons">
        <button className="homepage-button" onClick={() => navigate("/login")}>
          Se connecter
        </button>
        <button className="homepage-button" onClick={() => navigate("/signup")}>
           S’inscrire
        </button>
      </div>
    </div>

    </>
   
  );
}

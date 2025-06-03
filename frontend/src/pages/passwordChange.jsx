import "./passwordChange.css"; 
import logo from "/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
    const navigate = useNavigate();
    const[email, setEmail] = useState("");
    const[message, setMessage] = useState("");
  
    const handlePasswordChange = async (e) => {
      e.preventDefault();
      const error = document.getElementById("email-error");
      try{
        const response = await axios.post("https://chefbot-tfm1.onrender.com/reset_password", {
          email,
        });
        setMessage(response.data.message);
        if (response.data.message === "Un email de réinitialisation vous a été envoyé"){
          error.textContent = "Un email de réinitialisation de mot de passe vous a été envoyé sur votre e-mail.";
          error.style.color = "green";
        }   else if (response.data.message === "Utilisateur non vérifié") {
          error.textContent = "L'utilisateur n'est pas vérifié, veuillez d'abord commencer par verifier votre adresse e-mail.";
          error.style.color = "red";
        } else{
          error.textContent = "Adresse email non reconnue par nos services.";
          error.style.color = "red";
        }
      } catch(error)    {
        setMessage("Erreur réseau, réessayez plus tard.");
      }
    }

    return (
    <div className="login-container">

      <div className="header">
        <img onClick={(e) => navigate("/")} src={logo} alt="ChefBOT Logo" id="logo-login-page" />
      </div>

      <div className="password-change-box">
        <h2 className="password-change-title">Changement du mot de passe</h2>
        <p className="password-change-text">Procédure à suivre pour changer votre mot de passe :</p>
        <ol>
            <li>Veuillez indiquer ci-dessous votre adresse courriel personnelle qui a servi à l'ouverture de votre compte.</li>
            <li>Un courriel de confirmation sera envoyé à votre adresse courriel comportant un lien de changement de mot de passe.</li>
        </ol>
        <form onSubmit={handlePasswordChange}>
          <div className="input-group" id="input">
            <span className="icon">📧</span>
            <input type="text" required  name="email" onChange={(e) => setEmail(e.target.value)} placeholder="E-mail / Courriel" className="email-input" />
          </div>
          <p id="email-error"></p>


          <button type="button" className="button" onClick={(e) => navigate("/login")}>Retour à la page de connexion</button>
          <button type="submit" className="button">Réinitialiser mon mot de passe</button>

        </form>

      </div>
    </div>
  );
}

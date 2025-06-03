import "./LoginCss.css"; 
import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AccessibilityButtons from "./AccessibilityButtons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token)  {
        try {
          const response = await axios.post("https://chefbot-tfm1.onrender.com/dashboard", {
            headers : {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (response.data.message === "Token valide")
            navigate( "/chatpage" );
          else {
            localStorage.removeItem("token");
            navigate( "/login" );
          }
        } catch(error) {
          localStorage.removeItem("token");
          navigate( "/login" );
        } 
      } 
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const checkbox = document.getElementById("terms");
    const error = document.getElementById("text-error");

    if (!checkbox.checked){
      error.style.display = "flex";
      error.textContent = "Vous devez accepter les conditions d'utilisation !";
      return;
    } else {
      error.style.display = "none";
      error.textContent = "";
    }

    try {
      const response = await axios.post("https://chefbot-tfm1.onrender.com/login", {
        email,
        password,
      });
      setMessage(response.data.message);
      if (response.data.message === "Connexion réussie")  {
        const token = response.data.token;
        localStorage.setItem("token", token);
        navigate("/chatpage");
      } else {
        const password_alert = document.getElementById("incorrect-password");
        password_alert.textContent = response.data.message;
        password_alert.style.display = "flex";
      } 
    } catch(error) {
      setMessage("Erreur réseau, réessayez plus tard.");
    }
  };

  return (
    <>
      <AccessibilityButtons />

      <div className="login-container">
        <div className="header">
          <img onClick={() => navigate("/")} id="logo-login-page" src="/logo.png" alt="ChefBOT Logo" />
        </div>

        <div className="login-box">
          <h2 className="login-title">Bienvenue à nouveau</h2>
          <p className="login-text">Connectez-vous pour accéder à votre compte</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <span className="icon">📧</span>
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                name="email" 
                placeholder="E-mail / Courriel" 
                className="login-input" 
                required 
              />
            </div>

            <div className="input-group">
              <span className="icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} // Affiche le texte ou des points
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                name="password" 
                placeholder="Mot de passe" 
                className="login-input" 
                required 
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye} // Change l'icône selon l'état
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)} // Bascule l'état
              />
            </div>

            <div className="forgot-password">
              <a href="#" onClick={(e) => navigate("/passwordchange")}>Mot de passe oublié ?</a>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                Je confirme avoir lu et accepté les <a href="#" onClick={() => navigate("/termsofuse")}>Conditions d'utilisation</a>.
              </label>
            </div>

            <p id="text-error"></p>
            <p id="incorrect-password"></p>

            <button type="submit" className="login-button">Me connecter</button>
          </form>

          <p className="register-link">
            Vous n’avez pas de compte encore ?{" "}
            <a id="url-to-signup" onClick={() => navigate("/signup")}>Inscription ici</a>
          </p>
        </div>
      </div>
    </>
  );
}

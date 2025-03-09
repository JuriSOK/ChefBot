import "./LoginCss.css"; 
import logo from "/logo.png";
import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const navigate = useNavigate();
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[message, setMessage] = useState("");


  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token)  {
        try {
          const response = await axios.get("http://localhost:5001/dashboard", {
            headers : {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          if (response.data.message === "bienvenu sur votre dashboard !")
            navigate("/chatpage");
          else{
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
        catch(error)  {
          localStorage.removeItem("token");
          navigate("/login");
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
      return;
    } else{
      error.style.display = "none";
    }
    
    
    try{
      const response = await axios.post("http://localhost:5001/login", {
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
    }
    catch(error)  {
      setMessage("Erreur réseau, réessayez plus tard.");
    }
  }


  return (
    <div className="login-container">
      
      <div className="header">
        <img onClick={(e) => navigate("/")} src={logo} alt="ChefBOT Logo" id="logo-login-page" />
        
      </div>

      <div className="login-box">
        <h2 className="login-title">Bienvenue à nouveau</h2>
        <p className="login-text">Connectez-vous pour accéder à votre compte</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <span className="icon">📧</span>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required  name="email" placeholder="E-mail / Numéro de téléphone" className="login-input" />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required name="password" placeholder="Mot de passe" className="login-input" />
          </div>

          <div className="forgot-password">
            <a href="#">Mot de passe oublié ?</a>
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
            Je confirme avoir lu et accepté les <a href="#">Conditions d'utilisation</a>.
            </label>
          </div>
          <p id="text-error">Vous devez accepter les conditions d'utilisation !</p>
          <p id="incorrect-password">Identifiant ou mot de passe incorrect !</p>

          <button type="submit" className="login-button">Me connecter</button>
        </form>

        <p className="register-link">
          Vous n’avez pas de compte encore ? <a id="url-to-signup" onClick={() => navigate("/signup")}> Inscription ici</a>
        </p>
      </div>
    </div>
  );
}

import "./inputNewPassword.css";
import logo from "/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function LoginPage() {
    
    const location = useLocation();
    const[pswd,setPswd] = useState("");
    const[message,setMessage] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromURL = params.get("token");
        if (tokenFromURL) {
            setToken(tokenFromURL);
        } else{
          alert("Token non trouvé dans l'URL !!! lien invalide");
          navigate("/passwordchange");
          return;
        }
    }, [location]);


    const navigate = useNavigate();
    const handlePasswordShow = (e) => {
      const checkbox = document.getElementById("password-show");
      const password = document.getElementById("password");
      const password_confirmation = document.getElementById("password-confirmation");
      if (checkbox.checked){
        password.type = "text";
        password_confirmation.type = "text";
      } else{
        password.type = "password";
        password_confirmation.type = "password";
      }
    }

    const handlePswd = (e) => {
      const error = document.getElementById("pswd-error");
      const password = document.getElementById("password");
      const password_confirmation = document.getElementById("password-confirmation");
      if (password.value === password_confirmation.value) {
        error.style.display = "none";
      } else{
        error.style.display = "flex";
      }
    }

    const handleNewPassword = async (e) => {
      const error = document.getElementById("pswd-error");
      e.preventDefault();
      const password = document.getElementById("password");
      const password_confirmation = document.getElementById("password-confirmation");
      if (password.value !== password_confirmation.value){
        return;
      }
      try{
        const response = await axios.post("https://chefbot-tfm1.onrender.com/change_password", {
          pswd,
          token,
        });
        setMessage(response.data.message);
        
        if (response.data.message === "Le lien est invalide ou a expiré"){
          error.textContent = "Ce lien est invalide ou a expiré, vous ne pouvez désormais plus changer votre mot de passe avec...";
          error.style.color = "red";
          error.style.display = "flex";
        } else if (response.data.message==="Le token est déjà utilisé")   {
          error.textContent = "Ce lien est déjà utilisé, vous ne pouvez désormais plus changer votre mot de passe avec...";
          error.style.color = "red";
          error.style.display = "flex";
        } else if (response.data.message==="Le token est invalide")   {
          alert("Le token est invalide, rederigez vous vers la page d'accueil !");
          error.textContent = "Le token est invalide";
          error.style.color = "red";
          error.style.display = "flex";
        } else{
          error.textContent = "Votre mot de passe est modifié avec succès !";
          error.style.color = "green";
          error.style.display = "flex";
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
        
        <form onSubmit={handleNewPassword}>
          <div className="input-group" id="input">
            <span className="icon">🔒</span>
            <input type="password" required minLength={8}  onKeyUp={(e) => handlePasswordShow()} onChange={(e) => {handlePswd(); setPswd(e.target.value);}} name="password" id="password" placeholder="Mot de passe" className="password-input" />
          </div>
          <div className="input-group" id="input">
            <span className="icon">🔒</span>
            <input type="password" required  minLength={8} onKeyUp={(e) => handlePasswordShow()} onChange={(e) => handlePswd()} name="password-confirmation" id="password-confirmation"  placeholder="Confirmation mot de passe" className="password-input" />
          </div>
          <div id="div-for-checkbox">
            <input type="checkbox" name="password-show" id="password-show" onChange={(e) => handlePasswordShow()} />
            <label htmlFor="password-show" id="label-for-checkbox">Afficher le mot de passe</label>
          </div>

          <p id="pswd-error">Les mots de passes ne sont pas identiques !</p>

          <button type="button" className="button" onClick={(e) => navigate("/login")}>Retour à la page de connexion</button>
          <button type="submit" className="button">Réinitialiser mon mot de passe</button>

        </form>

      </div>
    </div>
  );
}

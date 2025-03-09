import "./SignupPage.css";
import logo from "/logo.png"; 
import React, { use, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function SignupPage() {
  const navigate = useNavigate();
  const[email, setEmail] = useState("");
  const[first_name, setFirstName] = useState("");
  const[last_name, setLastName] = useState("");
  const[password, setPassword] = useState("");
  const[message, setMessage] = useState("");

  function is_name(name) {
    return /^[a-zA-Z\s-]+$/.test(name);
  }

  const verify_name_validation = (name_entry) => {
    const error_name = document.getElementById("first-or-last-name-error");
    if (name_entry!=="" && !is_name(name_entry)){
      error_name.style.display = "flex";
    } else{
      error_name.style.display = "none";
    }
  }

  const verify_password_correspondance = (e) => {
    const pswd = document.getElementById("pswd");
    const pswd_confirmation = document.getElementById("pswd-confirmation");
    const error_password = document.getElementById("password-confirmation-error");
    if (pswd.value != pswd_confirmation.value){
      error_password.style.display = "flex";
    } else {
      error_password.style.display = "none";
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    // vérifier si les mots de passes en entrées sont identiques... et si ils respectent bien la forme indiquée
    const pswd = document.getElementById("pswd");
    const password_confirmation = document.getElementById("pswd-confirmation");
    const error_password = document.getElementById("password-confirmation-error");
    if (pswd.value != password_confirmation.value)  {
      error_password.style.display = "flex";
      return
    } else  {
      error_password.style.display = "none";
    }

    
    // vérifier si les conditions d'utilisations sont accéptées
    const checkbox = document.getElementById("terms");
    const error_terms = document.getElementById("text-error");
    if (!checkbox.checked)  {
      error_terms.style.display = "flex";
      return;
    } else  {
      error_terms.style.display = "none";
    }

    console.log(first_name + " " + last_name + " " + password);
    try{
      const response = await axios.post("http://localhost:5001/signup", {
        email,
        first_name,
        last_name, 
        password,
      });
      setMessage(response.data.message);
      const result_of_inscription = document.getElementById("inscription-result");
      result_of_inscription.textContent = response.data.message;
      if (response.data.message==="Cet utilisateur est déjà inscrit sur notre plateforme !") {
        result_of_inscription.style.color = "red";
      } else {
        result_of_inscription.style.color = "green";
      }
    }
    catch(error)  {
      setMessage("Erreur réseau, réessayez plus tard.");
    }
  }

  return (
    <div className="signup-container">

      <div className="header">
        <img onClick={(e) => navigate("/")} src={logo} alt="ChefBOT Logo" id="logo-signup-page" />
      </div>


      <form onSubmit={handleSignUp}>
        <div className="signup-box">
          <h2 className="signup-title">Créer un compte</h2>
          <p className="signup-text">
            Seuls les e-mails valides peuvent être utilisés
            pour créer un nouveau compte !!
          </p>
          <p id="inscription-result"></p>
          <br />

        
          <div className="input-group">
            <span className="icon">📧</span>
            <input type="text" value={email} onChange={(e) => {setEmail(e.target.value)}} required name="email" placeholder="E-mail / Numéro de téléphone" className="signup-input" />
          </div>

      
          <div className="input-row">
            <div className="input-group">
              <span className="icon">👤</span>
              <input type="text" value={last_name} onChange={(e) => {setLastName(e.target.value); verify_name_validation(e.target.value);}} name="last_name" required placeholder="Nom" className="signup-input" />
            </div>
            <div className="input-group">
              <input type="text"  value={first_name} onChange={(e) => {setFirstName(e.target.value); verify_name_validation(e.target.value);}} name="first_name" required placeholder="Prénom" className="signup-input" />
            </div>
          </div>
          <p id="first-or-last-name-error">Le nom, prénom doit être composé que de lettres, espaces, tirêts(-) !</p>

        
          <div className="input-group">
            <span className="icon">🔒</span>
            <input type="password" minLength={8} id="pswd" required value={password}  onChange={(e) => {setPassword(e.target.value);verify_password_correspondance();}} name="password" placeholder="Mot de passe" className="signup-input" />
          </div>

  
          <div className="input-group">
            <span className="icon">🔑</span>
            <input type="password" minLength={8} id="pswd-confirmation" onChange={verify_password_correspondance} required name="password_confirmation" placeholder="Confirmez votre mot de passe" className="signup-input" />
          </div>
          <p id="password-confirmation-error">Les mots de passes ne sont pas identiques !</p>

          <p className="password-note">
            Le mot de passe doit comporter au minimum une lettre majuscule, un chiffre et un caractère spécial (ex. !, @, #).
          </p>

      
          <div className="checkbox-group">
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">
              Je confirme avoir lu et accepté les <a href="#">Conditions d'utilisation</a> de ChefBOT.
            </label>
          </div>
          <p id="text-error">Vous devez accepter les conditions d'utilisation !</p>


      
          <button type="submit" className="signup-button">Créer mon compte</button> 

        
        
          <p className="login-link">
            Vous avez déjà un compte ? <a id="url-to-login" onClick={(e) => navigate("/login")}>Cliquez ici pour vous connecter</a>
          </p>

        </div>
      </form>
      
    </div>
  );
}

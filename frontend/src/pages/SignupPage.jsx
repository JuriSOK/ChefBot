import "./SignupPage.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AccessibilityButtons from "./AccessibilityButtons";

export default function SignupPage() {
  const logo = "/logo.png";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function is_name(name) {
    return /^[a-zA-Z\s-]*$/.test(name);
  }

  const verify_name_validation = (name_entry) => {
    const error_name = document.getElementById("first-or-last-name-error");
    error_name.style.display = is_name(name_entry) ? "none" : "flex";
    error_name.textContent = is_name(name_entry) ? "" : "Le nom, prénom doit être composé que de lettres, espaces, tirêts(-) !";
  };

  const verify_password_correspondance = () => {
    const pswd = document.getElementById("pswd");
    const confirm = document.getElementById("pswd-confirmation");
    const error = document.getElementById("password-confirmation-error");
    error.style.display = pswd.value === confirm.value ? "none" : "flex";
    error.textContent = pswd.value === confirm.value ? "" : "Les mots de passes ne sont pas identiques !";
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const pswd = document.getElementById("pswd");
    const confirm = document.getElementById("pswd-confirmation");
    const terms = document.getElementById("terms");

    if (pswd.value !== confirm.value) {
      document.getElementById("password-confirmation-error").style.display = "flex";
      document.getElementById("password-confirmation-error").textContent = "Les mots de passes ne sont pas identiques !";
      return;
    }

    if (!terms.checked) {
      document.getElementById("text-error").style.display = "flex";
      document.getELementById("text-error").textContent = "Vous devez accepter les conditions d'utilisation !";
      return;
    }

    try {
      const response = await axios.post("https://chefbot-tfm1.onrender.com/signup", {
        email,
        first_name,
        last_name,
        password,
      });

      setMessage(response.data.message);
      const result = document.getElementById("inscription-result");
      result.textContent = response.data.message;
      result.style.color =
        response.data.message === "Cet utilisateur est déjà inscrit sur notre plateforme !" ? "red" : "green";
    } catch {
      setMessage("Erreur réseau, réessayez plus tard.");
    }
  };

  return (
    <>
      <AccessibilityButtons />
      <div className="signup-container">
        <div className="header">
          <div className="logo-wrapper">
            <img id="logo-signup-page" src={logo} alt="ChefBot" onClick={() => navigate("/")} />
          </div>
        </div>
        <form onSubmit={handleSignUp}>
          <div className="signup-box">
            <h2 className="signup-title">Créer un compte</h2>
            <p className="signup-text">
              Seuls les e-mails valides peuvent être utilisés pour créer un nouveau compte !!
            </p>
            <p id="inscription-result"></p>

            <div className="input-group">
              <span className="icon">📧</span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-mail / Courriel"
                className="signup-input"
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <span className="icon">👤</span>
                <input
                  type="text"
                  value={last_name}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    verify_name_validation(e.target.value);
                  }}
                  placeholder="Nom"
                  className="signup-input"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  value={first_name}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    verify_name_validation(e.target.value);
                  }}
                  placeholder="Prénom"
                  className="signup-input"
                  required
                />
              </div>
            </div>
            <p id="first-or-last-name-error"></p>

            <div className="input-group">
              <span className="icon">🔒</span>
              <input
                type="password"
                id="pswd"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  verify_password_correspondance();
                }}
                placeholder="Mot de passe"
                className="signup-input"
                required
                minLength={8}
              />
            </div>

            <div className="input-group">
              <span className="icon">🔑</span>
              <input
                type="password"
                id="pswd-confirmation"
                onChange={verify_password_correspondance}
                placeholder="Confirmez votre mot de passe"
                className="signup-input"
                required
                minLength={8}
              />
            </div>

            <p id="password-confirmation-error"></p>
            <p className="password-note">
              Le mot de passe doit comporter au minimum une lettre majuscule, un chiffre et un caractère spécial (ex. !, @, #).
            </p>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                Je confirme avoir lu et accepté les{" "}
                <a href="#" onClick={() => navigate("/termsofuse")}>
                  Conditions d'utilisation
                </a>{" "}
                de ChefBOT.
              </label>
            </div>
            <p id="text-error"></p>

            <button type="submit" className="signup-button">
              Créer mon compte
            </button>

            <p className="login-link">
              Vous avez déjà un compte ?{" "}
              <a id="url-to-login" onClick={() => navigate("/login")}>
                Cliquez ici pour vous connecter
              </a>
            </p>
            
          </div>
        </form>
      </div>
    </>
  );
}

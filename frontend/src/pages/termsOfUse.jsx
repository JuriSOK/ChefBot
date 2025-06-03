import "./termsOfUse.css";
import { useNavigate } from "react-router-dom";
import React from "react"; 

export default function HomePage() {
  const navigate = useNavigate(); 


  return (
    <div className="termsofuse-container">
      <img
        src="/logo.png" 
        alt="ChefBOT" 
        className="termsofuse-image"
        onClick={(e) => navigate("/")}
      />
      <p id="grand-titre">Conditions d'utilisations du ChefBot</p>
      <p id="publication">publié le 09 Mars 2025</p>

      <div id="termsOfUse">
        <div id="content">
          <h3>1. Présentation :</h3>
          <p>Bienvenue sur ChefBot, un chatbot interactif spécialisé dans le domaine de la cuisine. Développé par une équipe de quatre étudiants en Licence 3 Informatique à Paris City, ChefBot a pour objectif de fournir des conseils culinaires, des recettes et des informations sur les ingrédients en utilisant des modèles d'intelligence artificielle pré-entraînés.</p>
          <h3>2. Acceptation des conditions :</h3>
          <p>En accédant à ChefBot et en l’utilisant, vous acceptez sans réserve les présentes conditions d’utilisation. Si vous ne les acceptez pas, veuillez ne pas utiliser le service.</p>
          <h3>3. Fonctionnalités et utilisation ChefBot permet aux utilisateurs de :</h3>
          <li>Obtenir des recettes détaillées en fonction des ingrédients disponibles.</li>
          <li>Recevoir des conseils de cuisine adaptés.</li>
          <li>Poser des questions sur les techniques culinaires, les ingrédients et la gastronomie en général.</li>
          <li>Accéder à des recommandations basées sur des questions fréquentes.</li>
          <p>L’utilisation de ChefBot est gratuite et destinée à un usage personnel et non commercial.</p>
          <h3>4. Responsabilité et limites :</h3>
          <li>ChefBot fournit des réponses générées par une IA et bien que nous nous efforcions d’assurer leur pertinence et exactitude, nous ne garantissons pas l’exactitude absolue des informations fournies.</li>
          <li>L’utilisateur est responsable de la vérification des informations obtenues avant de les appliquer, notamment en matière de santé et d’allergies alimentaires.</li>
          <li>ChefBot ne remplace en aucun cas l’avis d’un professionnel de la nutrition ou de la santé.</li>
          <h3>5. Confidentialité et protection des données</h3>
          <li>Aucune donnée personnelle sensible n’est stockée ou collectée par ChefBot.</li>
          <li>Les échanges avec le chatbot sont temporaires et ne sont pas enregistrés.</li>
          <li>L’utilisateur doit éviter de partager des informations personnelles lors de l’utilisation du service.</li>
          <h3>6. Modifications des conditions :</h3>
          <p>Nous nous réservons le droit de modifier ces conditions d’utilisation à tout moment. Toute mise à jour sera communiquée aux utilisateurs via notre plateforme.</p>
          <h3>7. Contact :</h3>
          <p>Pour toute question ou remarque concernant ces conditions d’utilisation, vous pouvez nous contacter à l’adresse suivante : [email de contact ou lien vers un formulaire].</p>
          <p>En utilisant ChefBot, vous reconnaissez avoir lu et compris ces conditions et vous engagez à les respecter.</p>
        </div>
      </div>


    </div>

  );
}
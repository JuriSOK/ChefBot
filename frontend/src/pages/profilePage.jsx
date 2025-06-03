import React, { useState, useEffect } from "react";
import "./profilePage.css";
import ReactMarkdown from "react-markdown";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import { marked } from "marked";
import { logoBase64} from "../../public/logoBase64.js";


export default function ProfilePage() {
  const [section, setSection] = useState("profil");
  

  const togglePreference = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  let action = "";
  if (section !== "profil")  {
    action = "run" + section;
  }  else {
      action = searchParams.get("action");
      if  ( (action !== "runpreferences" && action!== "runprofil")) {
        action = "runprofil";
      }   
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams);
  }
  useEffect(() => {
    const checkMyOwnSession = async () => {
      try{
        const token = localStorage.getItem("token");
        const response = await axios.get("https://chefbot-tfm1.onrender.com/dashboard", 
          {
            headers : {
              Authorization : `Bearer ${token}`,
              "Content-Type" : "application/json",
            },
          }
        );
        if (response.data.message === "Token manquant ou invalide !!") {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUsername(response.data.user);
          setFirstName(response.data.surname);
          setLastName(response.data.name);
        }
      } catch(error)  {
        navigate("/login");
      }
    };
    checkMyOwnSession();

    if (action === "runpreferences") {
      setSection("preferences");
    } else if (action === "runprofil")  {
      setSection("profil");
    } else if (action ===  "runfavoris")  {
      setSection("favoris");
    } else {
      setSection("password");
    }
  }, [navigate, action]);

  
  function is_first_name(name) {
    return /^[a-zA-Z\s-]+$/.test(name);
  }

  const verify_first_name_validation = (name_entry) => {
    const error_name = document.getElementById("first-name-error");
    if (!is_first_name(name_entry)){
      error_name.style.display = "flex";
      error_name.textContent = "Le nom, prénom doit être composé que de lettres, espaces, tirêts(-) !";
      error_name.style.color = "red";
    } else{
      error_name.style.display = "none";
    }
  }

  const change_first_last_name = async (e) => {
    e.preventDefault();
    if (!is_first_name(firstName) || !is_first_name(lastName)){
      return;
    }
    try{
      const response = await axios.post("https://chefbot-tfm1.onrender.com/changeNames",
        {
          firstName,
          lastName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },    
      );
      const error_name = document.getElementById("first-name-error");
      if (response.data.message === "Nom et Prenom changes avec succes")  {
        error_name.textContent = "Nom et/ou prénom modifiés avec succés";
        error_name.style.color = "green";
        error_name.style.display = "flex";
      } else {
        error_name.textContent = "Impossible de modifier le nom/prénom.. vérifiez votre connexion";
        error_name.style.color = "red";
        error_name.style.display = "flex";
      }
    } catch(error)  {
        error_name.textContent = "Impossible de modifier le nom/prénom.. vérifiez votre connexion";
        error_name.style.color = "red";
        error_name.style.display = "flex";
    }
  };

  const handlePasswordShow = (e) => {
    const checkbox = document.getElementById("password-show");
    const actual_password = document.getElementById("actualPassword");
    const new_password = document.getElementById("newPassword");
    const new_password_confirmation = document.getElementById("newPasswordConfirmation");
    if (checkbox.checked){
      actual_password.type = "text";
      new_password.type = "text";
      new_password_confirmation.type = "text";
    } else{
      actual_password.type = "password";
      new_password.type = "password";
      new_password_confirmation.type = "password";
    }
  }

  const checkPasswords = (e) => {
    const error_message = document.getElementById("error_on_password_change");
    const new_password = document.getElementById("newPassword");
    const new_password_confirmation = document.getElementById("newPasswordConfirmation");
    if (new_password.value !==  new_password_confirmation.value) {
      error_message.textContent = "Les mots de passes ne sont pas identiques !";
      error_message.style.display = "flex";
      error_message.style.color = "red";
    } else {
      error_message.style.display = "none";
    }
  }

  
  
  const change_password = async (e) => {
    e.preventDefault();
    const error_message = document.getElementById("error_on_password_change");
    const new_password = document.getElementById("newPassword");
    const new_password_confirmation = document.getElementById("newPasswordConfirmation");
    if (new_password.value !== new_password_confirmation.value) {
      error_message.textContent = "Les mots de passes ne sont pas identiques !";
      error_message.style.display = "flex";
      error_message.style.color = "red";
      return;
    } else {
      error_message.style.display = "none";
    }
    try{
      const myActualPassword = document.getElementById("actualPassword").value;
      const myNewPassword = document.getElementById("newPassword").value;
      const response = await axios.post("https://chefbot-tfm1.onrender.com/modifyPassword",
        {
          myActualPassword,
          myNewPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },    
      );
      if (response.data.message === "Mot de passe change")  {
        error_message.textContent = "Votre mot de passe a été modifié avec succés";
        error_message.style.color = "green";
        error_message.style.display = "flex";
      } else if (response.data.message === "Mot de passe actuel incorrect") {
        error_message.textContent = "Le mot de passe actuel en entrée est incorrect !";
        error_message.style.color = "red";
        error_message.style.display = "flex";
      } else if (response.data.message ==="Token manquant ou invalide !!") {
        error_message.textContent = "Impossible de modifier votre mot de passe.. vérifiez votre connexion";
        error_message.style.color = "red";
        error_message.style.display = "flex";
      }
    } catch(error) {
      error_message.textContent = "Impossible de modifier votre mot de passe.. vérifiez votre connexion";
      error_message.style.color = "red";
      error_message.style.display = "flex";
    }
  };

  const logout = (e) => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      if (localStorage.getItem("token") !== null) {
        localStorage.removeItem("token");
      }
      navigate("/login");
    }
  };

  const allergies = [
    "Gluten et Céréales",
    "Arachides",
    "Fruits à coque",
    "Crustacés",
    "Œufs",
    "Soja",
    "Lait (y compris Lactose)",
    "Légumineuses",
    "Poissons",
    "Lupin",
    "Sulfites",
    "Mollusques",
    "Sésame",
    "Moutarde",
  ];

  const ingredients = [
    "Viande",
    "Poisson",
    "Alcool",
    "Sucre raffiné",
    "Miel",
    "Porc et dérivés",
    "Produits laitiers",
    "Œufs",
  ];

  const regimes = [
    { nom: "Végétarien 🌱" , exclusions : ["Viande" , "Poisson"] },
    { nom: "Végan 🥑", exclusions: ["Viande", "Poisson", "Œufs", "Produits laitiers", "Miel"] },
    { nom: "Sans gluten 🥖", exclusions: ["Blé", "Orge", "Seigle", "Avoine non certifiée"] },
    { nom: "Halal 🕌", exclusions: ["Porc", "Alcool", "Viande non Halal", "Gélatine animale"] },
    { nom: "Casher ✡️", exclusions: ["Porc", "Fruits de mer", "Viande non Casher"] },
    { nom: "Keto 🔥", exclusions: ["Sucre", "Pain", "Pâtes", "Riz", "Pommes de terre"] },
    { nom: "Paléo 🥩", exclusions: ["Céréales", "légumineuses", "produits laitiers", "sucre raffiné", "aliments industriels"] },
    { nom: "Méditerranéen 🍏", exclusions: ["Excès de viande rouge", "produits ultra-transformés", "sucre raffiné"]},
  ];

  const objectifs_alimentaires = [
    { nom: "Perte de poids", descriptif: "Réduire les calories pour perdre du poids efficacement"},
    { nom: "Prise de muscle", descriptif: "Augmenter les protéines et calories pour la croissance musculaire"},
    { nom: "Maintien du poids", descriptif: "Stabiliser le poids en équilibrant calories et activité physique"},
    { nom: "Amélioration de la digestion", descriptif: "Favoriser les fibres et probiotiques pour une meilleure digestion"},
    { nom: "Santé cardiaque", descriptif: "Consommer des graisses saines et réduire le cholestérol"}, 
    { nom: "Énergie et performance", descriptif: "Optimiser l'alimentation pour une meilleure performance physique et mentale"},
  ];

  const equipements = [
    "🔥 Plaque de cuisson",
    "🏠 Four",
    "🍞 Air fryer",
    "🍲 Cookeo / Multicuiseur",
    "🍹 Blender / Mixeur",
    "🍛 Casserole / Cocotte",
    "🍳 Poêle / Sauteuse",
  ];


  const handleAutre = () => {
    const text_for_other_allergies = document.getElementById("other-allergies");
    text_for_other_allergies.disabled = !text_for_other_allergies.disabled;
  };



  const [myAllergies, setMyAllergies] = useState([]);
  const [myBannedIngredients, setMyBannedIngredients] = useState([]);
  const [myDiet, setMyDiet] = useState("Aucun régime");
  const [myFoodGoal, setMyFoodGoal] = useState("Aucun objectif");
  const [myKitchenEquipment, setMyKitchenEquipment] = useState(["Plaque de cuisson", "Poêle / Sauteuse", "Casserole / Cocotte"]);


  useEffect(()=> {
    const updateSession = async () => {
        try{
          const response = await axios.post("https://chefbot-tfm1.onrender.com/get_my_personnalisation",
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },    
          );
          if (response.data.message==="Personnalisation recuperee avec succes"){
            setMyAllergies(response.data.allergies);
            const autres_allergies = document.getElementById("other-allergies");
            if (response.data.have_other_allergies){
              autres_allergies.disabled = false;
              autres_allergies.value = response.data.myOtherAllergies.slice(7);
              document.getElementById("autres").checked=true;
            } else {
              autres_allergies.disabled = true;
              autres_allergies.value = "";
            }
            setMyBannedIngredients(response.data.banned_ingredients);
            setMyKitchenEquipment(response.data.kitchen_equipment);
            setMyFoodGoal(response.data.food_goal);
            setMyDiet(response.data.diet);
          }
        } catch(error)  {
          console.log(error);
        }
      };
      updateSession();
    },[]);

  const updateAllergies =   (event) => {
    const { value, checked } = event.target;
      setMyAllergies((prevAllergies) => 
        checked ? [...prevAllergies, value] : prevAllergies.filter((allergy) => allergy !== value)
      );
  };

  const updateBannedIngredients = (event) => {
    const {value, checked} = event.target;
    setMyBannedIngredients((prevBannedIngredients) => 
      checked ? [...prevBannedIngredients, value] : prevBannedIngredients.filter((ingredient) => ingredient !== value)
    );
  };

  const updateKitchenEquipment  = (event) => {
    const {value, checked} = event.target;
    setMyKitchenEquipment((prevKitchenEquipment) =>
      checked ? [...prevKitchenEquipment, value] : prevKitchenEquipment.filter((equipment) => equipment !== value)
    );
  };





  const handlePreferences = async (e) => {
    e.preventDefault();
    const myOtherAllergies = [`Autres:${document.getElementById("other-allergies").value}`];  
    const have_other_allergies = document.getElementById("autres").checked;

    const perso_error = document.getElementById("personnalisation-error");
    try {
      const response = await axios.post("https://chefbot-tfm1.onrender.com/personalize_my_profile",
        {
          myAllergies,
          myBannedIngredients,
          myDiet,
          myFoodGoal,
          myKitchenEquipment,
          myOtherAllergies,
          have_other_allergies,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.message === "Nouvelle personnalisation prise en compte") {
        perso_error.className = "success"; // Applique le style de succès
        perso_error.textContent = "C'est fait! votre nouvelle personnalisation est prise en compte";
        perso_error.style.display = "flex";
      } else {
        perso_error.style.display = "flex";
        perso_error.className = "error"; // Applique le style d'erreur
        perso_error.textContent = "Erreur réseau produite lors de la tentative de modification de votre personnalisation... Vérifiez votre connexion!";
      }
    } catch (error) {
      perso_error.className = "error"; // Applique le style d'erreur
      perso_error.textContent = "Erreur réseau produite lors de la tentative de modification de votre personnalisation... Vérifiez votre connexion!";
      perso_error.style.display = "flex";
    }
  };

  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    const updateSession = async (e) => {
      try{
        const response = await axios.post("https://chefbot-tfm1.onrender.com/get_my_favorites",
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },    
        );
        if (response.data.message === "Recuperation favoris utilisateur avec succes") {
          setFavorites(response.data.favorites);
        } else {
          console.log(response.data.message);
        }        
      } catch(error)  {
        console.log(error);
      }
    };
    updateSession();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [seeMoreTitle, SetSeeMoreTitle] = useState("");
  const [seeMoreContent, setSeeMoreContent] = useState("");


  const deleteFavorite = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément de vos favoris ?")) {
      try {
        const response = await axios.post(
          "https://chefbot-tfm1.onrender.com/deleteFavorite",
          { id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.message === "Favoris supprimé avec succées") {
          setFavorites((prev) => prev.filter((favorite) => favorite.id !== id));
        }
      } catch (error) {
        console.log(
          "Erreur réseau produite lors de la tentative de suppression de l'un de vos favoris... Vérifiez votre connexion!"
        );
      }
    }
  };

  const handleDownload = (title, content) => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;
  
    const checkPageBreak = (extraHeight = 10) => {
      if (yPosition + extraHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };
  
    const renderStyledText = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          checkPageBreak(15);
          pdf.text(line, margin, yPosition);
          yPosition+=8;
        });
        // yPosition+=5;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        let fontStyle = "normal";
        if (["STRONG", "B"].includes(node.nodeName)) fontStyle = "bold";
        if (["EM", "I"].includes(node.nodeName)) fontStyle = "italic";
        if (["STRONG", "B", "EM", "I"].includes(node.nodeName)) {
          pdf.setFont("helvetica", fontStyle);
          node.childNodes.forEach(renderStyledText);
        } else {
          node.childNodes.forEach(renderStyledText);
        }
      }
    };
  
    const renderNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        renderStyledText(node);
        return;
      }
  
      if (node.nodeType !== Node.ELEMENT_NODE) return;
  
      const tag = node.nodeName;
      pdf.setTextColor(0, 0, 0);
  
      switch (tag) {
        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6":
          if (tag==="H1") {
            pdf.setFontSize(17);
          } else if (tag==="H2"){
            pdf.setFontSize(16);
          } else if (tag==="H3"){
            pdf.setFontSize(15);
          } else{
            pdf.setFontSize(14);
          }
          checkPageBreak(15);
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 150);
          const headingLines = pdf.splitTextToSize(node.textContent, maxWidth);
          headingLines.forEach(line => {
            pdf.text(line, margin, yPosition);
            yPosition += 10;
          });
          // yPosition += 5;
          break;
  
        case "P":
          checkPageBreak(10);
          pdf.setFontSize(13);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
          node.childNodes.forEach(renderStyledText);
          // yPosition += 8;
          break;
  
        case "UL":
        case "OL":
          node.childNodes.forEach(li => {
            if (li.nodeName === "LI") {
              checkPageBreak(10);
              const prefix = "• ";
              pdf.setFont("helvetica", "normal");
              const line = prefix + li.textContent;
              const lines = pdf.splitTextToSize(line, maxWidth);
              lines.forEach(wrappedLine => {
                checkPageBreak(15);
                pdf.text(wrappedLine, margin + 5, yPosition);
                yPosition += 8;
              });
            }
          });
          break;
  
        case "BLOCKQUOTE":
          checkPageBreak(10);
          pdf.setFont("helvetica", "italic");
          pdf.setTextColor(100);
          const quoteLines = pdf.splitTextToSize(node.textContent, maxWidth - 10);
          quoteLines.forEach(line => {
            pdf.text(line, margin + 10, yPosition);
            yPosition += 8;
          });
          pdf.setTextColor(0, 0, 0);
          // yPosition += 5;
          break;
  
        default:
          node.childNodes.forEach(renderNode);
          break;
      }
    };
  
    // Convertir Markdown → HTML
    const html = marked(content);
    const container = document.createElement("div");
    container.innerHTML = html;
  
    // Titre principal
    pdf.setFontSize(18);
    pdf.setTextColor("red");
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(title, maxWidth);
    titleLines.forEach((line) => {
      pdf.text(line, margin, yPosition);
      yPosition += 15;
    });
  
    yPosition += 10;
  
    // Traitement récursif
    container.childNodes.forEach(renderNode);
  
    // ajouter les numeros de pages et les bordures et le logo
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // Bordure (ligne rectangle autour de la page)
      pdf.setDrawColor(255,0,0); // rouge
      pdf.setLineWidth(2); // bordure épaisse
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10); // x, y, w, h

      // Numéro de page
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const pageLabel = `Page ${i} / ${totalPages}`;
      const textWidth = pdf.getTextWidth(pageLabel);
      pdf.text(pageLabel, pageWidth - 10 - textWidth, pageHeight - 10); // bottom-right
    }

  
  pdf.setPage(1);
  pdf.addImage(logoBase64, "PNG", pageWidth-margin-20, 7, 30, 30); // x, y, width, height

    // Télécharger
    pdf.save(title+".pdf");
  };
  

  const handleLogoClick = () => {
    navigate("/chatpage", { replace: true }); // Utilisez replace pour éviter d'empiler dans l'historique
  };

  return (
    <div className="profile-container">
      {/* Logo */}
      <img onClick={handleLogoClick} src="/logo.png" alt="ChefBOT" className="logo" />

      {/* Sidebar */}
      <aside className="profilesidebar">
        <h2 className="profile-title">Profil utilisateur</h2>
        <button className="profile-button" onClick={() => {
          setShowModal(false);
          setSection("profil");
        }}>
          👤 Profil
        </button>
        <button className="profile-button" onClick={() => {
          setShowModal(false);
          setSection("favoris");
        }}>
          ⭐️ Favoris
        </button>
        <button className="profile-button" onClick={() => {
          setShowModal(false);
          setSection("preferences");
        }}>
          🥗 Préférences
        </button>
        <button className="profile-button" onClick={() => {
          setShowModal(false);
          setSection("password");
        }}>
          🔒 Changer mot de passe
        </button>
        <hr />
        <button className="logoutbutton" onClick={logout}>Se déconnecter</button>
      </aside>

      {/* Contenu principal */}
      <main className="profile-content">
        <div className="profile-card">
          {section === "profil" && (
            <>
              <div className="profile-pic-wrapper">
                <div className="initiaux-pic">
                  {((firstName)? firstName[0].toUpperCase() : "") + ((lastName)?lastName[0].toUpperCase():"")}
                </div>
              </div>
              <h2 className="profile-name">{firstName.charAt(0).toUpperCase() + firstName.slice(1) + " " + lastName.toUpperCase()}</h2>
              <p className="profile-email">{username}</p>

              <div className="info-fields">
                <div className="field-group">
                  <label>Nom</label>
                  <input type="text" value={lastName} onChange={(e) => {setLastName(e.target.value); verify_first_name_validation(e.target.value);}} />
                </div>
                <div className="field-group">
                  <label>Prénom</label>
                  <input type="text" value={firstName} onChange={(e) => {setFirstName(e.target.value); verify_first_name_validation(e.target.value);}} />
                </div>
              </div>
              <p id="first-name-error"></p>

              <button className="save-button" onClick={change_first_last_name}>💾 Enregistrer</button>
            </>
          )}

{section === "preferences" && (
  <form name="formulaire-preferences" onSubmit={handlePreferences}>
      <div className="preferences-form">
      <h3>Allergies</h3>
      <div id="allergies-div">
        {allergies.map((allergy) => (
          <label key={allergy} className="allergies-label-div">
            <input 
              type="checkbox"
              value={allergy}
              id={allergy}
              onChange={(e) =>{updateAllergies(e);}} 
              checked={myAllergies.indexOf(allergy)!==-1}
              />
            <span>{allergy}</span>
          </label>
        ))}
        <label key="Autres" className="allergies-label-div">
            <input 
              type="checkbox"
              value="Autres"
              id="autres"
              onChange={(e) => {handleAutre();}} />
            <span>Autres</span>
        </label>
      </div>
      <input type="text" id="other-allergies" disabled placeholder="Pour saisir d'autres allergies, choisissez 'Autres'"/>
      
      <h3>Ingrédients interdits</h3>
      <div id="ingredients-interdits-div">
        {ingredients.map((ingredient) => (
          <label key={ingredient} className="ingredients-interdits-label-div">
            <input 
              type="checkbox"
              value={ingredient} 
              id={ingredient}
              onChange={updateBannedIngredients} 
              checked={myBannedIngredients.indexOf(ingredient)!==-1}
              />
            <span>{ingredient}</span>
          </label>
        ))}
      </div>

      <h3>Régimes alimentaires</h3>
      <select name="regime_alimentaire" value={myDiet} id="regime-select" onChange={(e) => {setMyDiet(e.target.value)}} >
        <option value="" disabled>-- Sélectionnez votre régime alimentaire --</option>
        <option value="Aucun régime" >Aucun régime</option>
        {regimes.map((regime) => (
          <option key={regime.nom} value={regime.nom.slice(0, regime.nom.length-3)} >{regime.nom+" Aliments exclus : "+ regime.exclusions.map((exclusion) => (exclusion+" "))}</option>
        ))}
      </select>

      <h3>Objectifs alimentaires</h3>
      <select name="objectif_alimentaire" value={myFoodGoal} id="objectif-select" onChange={(e) => {setMyFoodGoal(e.target.value)}}>
        <option value="" disabled>-- Sélectionnez votre objectif alimentaire --</option>
        <option value="Aucun objectif" >Aucun objectif</option>
        {objectifs_alimentaires.map((objectif) => (
          <option key={objectif.nom} value={objectif.nom}>{objectif.nom+"  --  "+ objectif.descriptif}</option>
        ))}
      </select>

      <h3>Équipements de cuisine disponibles</h3>
      <div id="equipements-div">
        {equipements.map((equipement) => (
          <label key={equipement} className="equipements-label-div">
            <input 
              type="checkbox"
              value={equipement.slice(3)} 
              id={equipement} 
              onChange={updateKitchenEquipment}
              checked={myKitchenEquipment.indexOf(equipement.slice(3))!==-1}
              />
            <span>{equipement}</span>
          </label>
        ))}
      </div>
      <p id="personnalisation-error"></p>
      <input type="submit" className="save-button" value="Enregistrer " />
    </div>
  </form>
)}


          {section === "password" && (
            <form onSubmit={change_password}>
              <div className="password-form">
                <h3>Changer le mot de passe :</h3>
                <input type="password" id="actualPassword" onKeyUp={(e) => handlePasswordShow()} required placeholder="Mot de passe actuel" />
                <input type="password" id="newPassword" onKeyUp={(e) => handlePasswordShow()} onChange={(e) => {checkPasswords(); }} required minLength={8} placeholder="Nouveau mot de passe" />
                <input type="password" id="newPasswordConfirmation" onKeyUp={(e) => handlePasswordShow()} onChange={(e) => {checkPasswords(); }} required minLength={8} placeholder="Confirmez le nouveau mot de passe" />
                <div id="div-for-password-show">
                  <input type="checkbox" onChange={(e) => handlePasswordShow()} name="password-show" id="password-show" />
                  <label htmlFor="password-show" id="label-for-checkbox">Afficher le mot de passe</label>
                </div>
                <p id="error_on_password_change"></p>
                <input type="submit" className="save-button" value="Changer mon mot de passe" />
              </div>
            </form>
          )}

          {section === "favoris" && (
            <>
              <section className="favorites-section">
                <h2>🛠 Astuces de Cuisine</h2>
                <div className="favorites-list">
                  {favorites
                  .filter((favorite) => favorite.type==="Astuce de cuisine")
                  .map((favorite) => (
                    <div className="favorite-item" key={favorite.title}>
                      <ReactMarkdown>{favorite.title}</ReactMarkdown>
                      <div className="favorite-actions">
                        <button key={favorite.id} onClick={(e) => {
                            SetSeeMoreTitle(favorite.title);
                            setSeeMoreContent(favorite.content);
                            setShowModal(true);
                          }
                        }>➕</button>
                        <button key={favorite.id} onClick={() => {handleDownload(favorite.title, favorite.content)}} >📖</button>
                        <button key={favorite.id} onClick={() => {deleteFavorite(favorite.id)}} >🗑</button>
                      </div>
                    </div>
                  ))}              
                </div>
              </section>

              <section className="favorites-section">
                <h2>📖 Recettes enregistrées</h2>
                <div className="favorites-list">
                    { favorites
                      .filter((favorite) => favorite.type==="Recette pertinente")
                      .map((favorite) => (
                        <div className="favorite-item" key={favorite.title}>
                          <ReactMarkdown>{favorite.title}</ReactMarkdown>
                          <div className="favorite-actions">
                            <button key={favorite.id} onClick={(e) => {
                                SetSeeMoreTitle(favorite.title);
                                setSeeMoreContent(favorite.content);
                                setShowModal(true);
                            }}>➕</button>
                            <button key={favorite.id} onClick={() => {handleDownload(favorite.title, favorite.content)}} >📖</button>
                            <button key={favorite.id} onClick={() => {deleteFavorite(favorite.id)}} >🗑</button>
                          </div>
                        </div>
                  ))}
                  
                </div>
              </section>
            </>
          )}
        </div>
      {showModal && (
        <div className="see-more-window">
        
                <div>
                  <div id="relative-box">
                    <button
                      className="close-button"
                      onClick={() => setShowModal(false)}
                    >
                      &times;
                    </button>
                    <h3 className="">
                      {seeMoreTitle}
                    </h3>
                    <ReactMarkdown>
                      {seeMoreContent}
                    </ReactMarkdown>
                  </div>
                </div>
          </div>
        )}
      </main>
    </div>
  );
}


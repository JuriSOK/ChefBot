import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./ChatPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faThumbsUp,
  faRightFromBracket,
  faEllipsisV,
  faTrashAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [user_name, setUsername] = useState(" ");
  const [user_surname, setUsersurname] = useState(" ");
  const [showSidebar, setShowSidebar] = useState(false);
  const defaultMessage =
    "Je ne brûle jamais un plat sauf si vous me le demandez... Que voulez-vous cuisiner ?";
  const navigate = useNavigate();

  useEffect(() => {
    const checkMySession = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://chefbot-tfm1.onrender.com/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data.message === "Token manquant ou invalide !!") {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUsername(response.data.name);
          setUsersurname(response.data.surname);
        }
      } catch (error) {
        navigate("/login");
      }
    };
    checkMySession();
    fetchConversations();
  }, [navigate]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("https://chefbot-tfm1.onrender.com/conversations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations :", error);
    }
  };

  const fetchConversation = async (id) => {
    try {
      const response = await fetch(`https://chefbot-tfm1.onrender.com/conversations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setMessages(JSON.parse(data.messages));
      setCurrentConversation(id);
    } catch (error) {
      console.error("Erreur lors de la récupération de la conversation :", error);
    }
  };

  const createConversation = async (title) => {
    try {
      const response = await fetch("https://chefbot-tfm1.onrender.com/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      setConversations((prev) => [...prev, data]);
      await fetchConversation(data.id);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation :", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentConversation) {
      await createConversation("Nouvelle Conversation");
    }

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    const loadingMessage = { role: "assistant", content: "Chargement...", loading: true };
    setMessages((prev) => [...prev, loadingMessage]);
    const loadingIndex = messages.length + 1;

    try {
      const response = await fetch(`https://chefbot-tfm1.onrender.com/chat/${currentConversation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[loadingIndex] = { role: "assistant", content: "", loading: false };
        return newMessages;
      });
      animateText(loadingIndex, data.reply);
      await fetchConversations();
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[loadingIndex] = {
          role: "assistant",
          content: "Oups, une erreur s'est produite !",
          loading: false,
        };
        return newMessages;
      });
    }
  };

  const animateText = (index, fullText) => {
    const words = fullText.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[index] = {
          ...newMessages[index],
          content: words.slice(0, i + 1).join(" "),
          loading: false,
        };
        return newMessages;
      });
      i++;
      if (i >= words.length) clearInterval(interval);
    }, 50);
  };

  const handleProfileBulle = () => {
    const list = document.getElementById("parametres");
    list.style.display = list.style.display === "none" ? "block" : "none";
  };

  const logout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const openMessageMenu = (id) => {
    const menu = document.querySelector(`#${id} .list-trois-points`);
    if (menu) {
      menu.classList.toggle("show"); // Ajoute ou retire la classe "show"
    }
  };

  const addFavorite = async (type, title, content) => {
    const error_message = document.getElementById("error-message-for-favorites-add");
    const titlePersonnalization = prompt("Entrez le titre de votre favoris :");
    if (titlePersonnalization !== "") {
      title = titlePersonnalization;
    }
    try {
      const response = await axios.post(
        "https://chefbot-tfm1.onrender.com/add_favorite",
        { type,
          title,
          content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.message === "Favoris ajoute avec succes") {
        error_message.className = "success"; // Applique le style de succès
        error_message.style.display = "block";
        error_message.textContent =
          "Votre " + type + " est ajouté dans votre sélection de favoris avec succès.";
      } else {
        throw new Error();
      }
    } catch (error) {
      error_message.className = "error"; // Applique le style d'erreur
      error_message.style.display = "block";
      error_message.textContent =
        "Échec d'ajout de votre " + type + " dans votre sélection de favoris !";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="chat-container">
      <div id="profile-bulle" onClick={handleProfileBulle}>
        {user_name[0].toUpperCase()}
        {user_surname[0].toUpperCase()}
      </div>
      <div id="parametres">
        <ul id="liste_parametres">
          <li onClick={() => navigate("/userprofile?action=runprofil")}>
            <FontAwesomeIcon icon={faUser} /> &nbsp; Profil
          </li>
          <li onClick={() => navigate("/userprofile?action=runpreferences")}>
            <FontAwesomeIcon icon={faThumbsUp} /> &nbsp; Préférences
          </li>
          <li onClick={logout}>
            <FontAwesomeIcon icon={faRightFromBracket} /> &nbsp; Déconnexion
          </li>
        </ul>
      </div>

      <button className="burger-button-chat" onClick={() => setShowSidebar(!showSidebar)}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      <div className="accessibility-buttons">
        <button className="accessibility-button" onClick={() => document.body.classList.toggle("dyslexic-font")}>
        🔤 Dyslexique
        </button>
        <button className="accessibility-button" onClick={() => document.body.classList.toggle("high-contrast")}>
        🔆 Contraste
        </button>
      </div>

      <aside className={`sidebar ${showSidebar ? "show" : ""}`}>
        <h2 className="sidebar-title">📜 Historique de conversations</h2>
        <ul className="conversation-list">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={conv.id === currentConversation ? "active-conversation" : ""}
              onClick={() => fetchConversation(conv.id)}
            >
              <div className="conversation-header">
                <span onClick={() => fetchConversation(conv.id)}>{conv.title}</span>
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  className="delete-icon"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("Supprimer cette conversation ?")) {
                      try {
                        await axios.delete(`https://chefbot-tfm1.onrender.com/conversations/${conv.id}`, {
                          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        });
                        setConversations((prev) =>
                          prev.filter((c) => c.id !== conv.id)
                        );
                        if (currentConversation === conv.id) setMessages([]);
                      } catch (error) {
                        alert("Erreur : " + error.response?.data?.message);
                      }
                    }
                  }}
                />
              </div>
              <small>{formatDate(conv.created_at)}</small>
            </li>
          ))}
          <li onClick={() => createConversation("Nouvelle Conversation")}>
            + Nouvelle Conversation
          </li>
        </ul>
      </aside>

      <main className="chat-box">
        <div className="chat-header">
          <img src="/logo.png" alt="ChefBOT Logo" className="chat-logo" />
        </div>
        <p id="error-message-for-favorites-add"></p>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="default-text">{defaultMessage}</p>
          ) : (
            messages.map((msg, index) => (
              <div
                className="one-message"
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column", // Permet d'empiler le message et le menu
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start", // Aligne selon le rôle
                }}
              >
                {msg.role === "user" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                    <ul className="trois_points" id={"list" + index}>
                      <FontAwesomeIcon
                        className="icon-trois-points"
                        onClick={() => openMessageMenu("list" + index)}
                        icon={faEllipsisV}
                      />
                      <div className="list-trois-points">
                        <li
                          onClick={() =>
                            addFavorite(
                              "Recette pertinente",
                              msg.content,
                              messages[index + 1]?.content
                            )
                          }
                        >
                          Favoris: Recette pertinente
                        </li>
                        <li
                          onClick={() =>
                            addFavorite(
                              "Astuce de cuisine",
                              msg.content,
                              messages[index + 1]?.content
                            )
                          }
                        >
                          Favoris: Astuce de cuisine
                        </li>
                      </div>
                    </ul>
                    <div className="user-message">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {msg.role !== "user" && (
                  <div className="bot-message">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {currentConversation && (
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              value={message}
              placeholder={defaultMessage}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="send-button" onClick={sendMessage}>
              📩
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

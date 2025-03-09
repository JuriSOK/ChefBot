import React, { useState } from "react";
import ReactMarkdown from "react-markdown"; // Importer react-markdown
import "./ChatPage.css";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const defaultMessage = "Je ne brûle jamais un plat sauf si vous me le demander... Que voulez-vous cuisiner ?";

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Ajouter le message de l'utilisateur à l'historique
    const userMessage = { role: "user", content: message };
    setMessages([...messages, userMessage]);

    // Réinitialiser le champ de saisie
    setMessage("");

    // Appeler l'API Flask
    try {
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      // Ajouter la réponse du bot à l'historique
      const botMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error);
      const errorMessage = { role: "assistant", content: "Oups, une erreur s'est produite !" };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">📜 Historique de conversations</h2>
        <ul className="conversation-list">
          <li>Aujourd'hui</li>
          <li>Recette Chili con carne</li>
          <li>Recette Éclair au chocolat</li>
          <li>Hier</li>
          <li>Recette Bœuf Bourguignon</li>
          <li>Recette noix de coco</li>
          <li>La semaine dernière</li>
          <li>Idées de repas riches en protéines</li>
          <li>Plan végétarien 2000 kcal</li>
        </ul>
      </aside>

      <main className="chat-box">
        <div className="chat-header">
          <img src="/logo.png" alt="ChefBOT Logo" className="chat-logo" />
        </div>

        {/* Zone d'affichage des messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="default-text">{defaultMessage}</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={msg.role === "user" ? "user-message" : "bot-message"}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown> {/* Rendu Markdown */}
              </div>
            ))
          )}
        </div>

        {/* Zone de saisie */}
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={message}
            placeholder={defaultMessage}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => message === "" && setMessage("")}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-button" onClick={sendMessage}>📩</button>
        </div>
      </main>
    </div>
  );
}
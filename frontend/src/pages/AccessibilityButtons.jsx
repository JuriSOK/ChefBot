import React from "react";
import "./accessibility.css";

export default function AccessibilityButtons() {
  const toggleContrast = () => {
    document.body.classList.toggle("high-contrast");
  };

  const toggleDyslexicFont = () => {
    document.body.classList.toggle("dyslexic-font");
  };

  return (
    <div className="accessibility-tools">
      <button onClick={toggleContrast}>🔆 Contraste</button>
      <button onClick={toggleDyslexicFont}>🔤 Dyslexie</button>
    </div>
  );
}

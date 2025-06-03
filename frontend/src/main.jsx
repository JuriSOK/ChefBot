import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./pages/index.css";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import PasswordChangePage from "./pages/passwordChange";
import InputNewPasswordPage from "./pages/inputNewPassword";
import TermsOfUsePage from "./pages/termsOfUse";
import ProfilePage from "./pages/profilePage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/chatPage" element={<ChatPage />}/>
        <Route path="/termsOfUse" element={<TermsOfUsePage />}/>
        <Route path="/passwordChange" element={<PasswordChangePage />}/>
        <Route path="/inputnewpassword" element={<InputNewPasswordPage />}/>
        <Route path="/userprofile" element={<ProfilePage />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

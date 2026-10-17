import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoginPage>
      {({ user, onLogout }) => (
        <App key={user.uid} user={user} onSignOut={onLogout} />
      )}
    </LoginPage>
  </StrictMode>,
);

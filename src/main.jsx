import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initializeTheme } from "./utils/theme.js";

initializeTheme();

// Register Ad Blocker Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/ad-blocker-sw.js")
      .then((reg) => {
        console.log("[AdBlocker SW] Registered:", reg.scope);
      })
      .catch((err) => {
        console.warn("[AdBlocker SW] Registration failed:", err);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

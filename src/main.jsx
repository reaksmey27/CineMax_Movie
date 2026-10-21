import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initializeTheme } from "./utils/theme.js";

// ─── Bootstrap: apply stored theme on startup ─────────────────────────────────

initializeTheme();

// ─── Service Worker: register ad-blocker SW ───────────────────────────────────

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

// ─── Render: mount React app in StrictMode ────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// src/app/app.js — top-level entry point.
import { startApp } from "./bootstrap.js";

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    startApp().catch((err) => console.error("Failed to start app:", err));
  });
}

export { startApp };

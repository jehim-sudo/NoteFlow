import React from "react";
import { createRoot } from "react-dom/client";
import NoteFlow from "./App.jsx";

/* Self-hosted display typeface. The app's stylesheet also links Google Fonts as
   a fallback, but these local files are what make it render offline in the APK. */
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";

import "./index.css";

/* ------------------------------------------------------------------
   Storage bridge.

   App.jsx persists through `window.storage`, which only exists inside
   the Claude artifact sandbox. On a real device (or any browser) we
   provide the same async key/value contract on top of localStorage,
   so the app code needs no changes at all.
------------------------------------------------------------------- */
if (!window.storage) {
  const PREFIX = "noteflow::";
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(PREFIX + key);
      if (value === null) throw new Error("Key not found: " + key);
      return { key, value, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, String(value));
      return { key, value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX + prefix))
        .map((k) => k.slice(PREFIX.length));
      return { keys, prefix, shared: false };
    },
  };
}

/* Offline caching for the installable web (PWA) build.
   Capacitor bundles assets locally, so this is a no-op inside the APK. */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    /* Try the site root first so the worker controls the whole app; fall back to
       a relative path if the app is deployed inside a subfolder. */
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => navigator.serviceWorker.register("./sw.js"))
      .catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NoteFlow />
  </React.StrictMode>
);

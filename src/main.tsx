// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HereMapProvider } from "@/components/here-map-context";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HereMapProvider>
      <App />
    </HereMapProvider>
  </React.StrictMode>
);

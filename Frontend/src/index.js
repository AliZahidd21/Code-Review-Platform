import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <div className="bg-secondary text-light min-vh-100">
    <App />
  </div>,
  document.getElementById("root")
);

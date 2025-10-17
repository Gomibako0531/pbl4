import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ✅ BootstrapのCSSとJSを読み込み
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

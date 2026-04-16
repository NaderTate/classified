import "./globals.css";
import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return <div className="p-8 text-white">Classified — Web App Scaffold</div>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

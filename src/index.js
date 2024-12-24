import React from "react";
import { createRoot } from "react-dom/client"; // Import createRoot from react-dom/client
import App from "./App";
import { ConfigProvider } from "./ConfigContext";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root"); // Get the root container

if (!container) {
  throw new Error("Root container missing in index.html");
}

// Create a root.
const root = createRoot(container); // Create a root.

// Initial render
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

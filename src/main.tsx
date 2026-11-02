import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./styles/brand.css";
import "./styles/home-hero.css";
import "./styles/home-learning.css";
import "./styles/subpage.css";
import "./styles/domain.css";
import "./styles/investing-roadmap.css";
import "./styles/trust.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);

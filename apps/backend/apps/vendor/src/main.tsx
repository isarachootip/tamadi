import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mercurjs/vendor/index.css";
import "./styles/tamadee-vendor.css";
import App from "@mercurjs/vendor";
import { installGlobalImageAutoResize } from "./lib/global-image-auto-resize";
import { initLightThemeDefault } from "./lib/theme-bootstrap";

initLightThemeDefault();
installGlobalImageAutoResize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

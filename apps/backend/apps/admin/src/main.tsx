import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mercurjs/admin/index.css";
import App from "@mercurjs/admin";
import { installAdminUsernameLogin } from "./lib/admin-username-login";
import { installStaleChunkRecovery } from "./lib/stale-chunk-recovery";

installStaleChunkRecovery();
installAdminUsernameLogin();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./App/router";
import "./i18n";
import "./index.css";
import { initTheme } from "./stores/theme.store";

// Paint the stored theme before React mounts, so there is no light flash.
initTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

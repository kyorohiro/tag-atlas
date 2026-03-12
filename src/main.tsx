import './index.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DialogProvider } from "./useDialog";
import { AppStateProvider } from './AppStateContext';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DialogProvider>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </DialogProvider>
  </React.StrictMode>,
);

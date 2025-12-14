import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import {ThemeProvider} from "next-themes";
import App from "./ui/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>
);

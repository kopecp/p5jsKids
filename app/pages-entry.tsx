import { createRoot } from "react-dom/client";
import { MathGarden } from "./MathGarden";
import "./globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Brak elementu #root dla aplikacji.");
}

createRoot(root).render(<MathGarden />);

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matematyczny ogród — 7 eksperymentów w p5.js",
  description: "Interaktywne wizualizacje dla dzieci, w tym Mandelbrot, liczby pierwsze, piękne wzory oraz samochodzik na wstędze Möbiusa.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

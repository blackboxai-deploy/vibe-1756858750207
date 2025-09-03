import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "TeamWork - Colaboración Empresarial",
  description: "Plataforma interna de trabajo en equipo para gestión de proyectos, comunicación y archivos",
  keywords: ["trabajo en equipo", "gestión de proyectos", "colaboración", "chat", "archivos"],
  authors: [{ name: "TeamWork App" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
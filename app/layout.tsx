import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MecánicaPro - Sistema de Gestión para Talleres",
  description: "Administra tu taller mecánico de manera profesional. Órdenes de trabajo, clientes, inventario y más.",
  keywords: "taller mecánico, gestión, órdenes de trabajo, mecánico, México",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

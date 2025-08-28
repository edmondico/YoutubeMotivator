import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/context/ConfigContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokeBim Motivator - Tu Entrenador PokéTuber",
  description: "Aplicación motivacional para PokeBim: gestiona tareas, trackea tu progreso en YouTube y conviértete en el mejor PokéTuber con gamificación y recordatorios diarios.",
  keywords: ["YouTube", "PokeBim", "productividad", "tareas", "gamificación", "motivación"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}

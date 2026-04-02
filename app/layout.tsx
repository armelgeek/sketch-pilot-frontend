import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { UtmCapturer } from "@/src/app/tracking";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Sketch Pilot — Whiteboard Animation Platform",
  description:
    "Générez des vidéos whiteboard captivantes avec une narration fluide et des personnages cohérents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={comfortaa.variable}>
      <body className="antialiased font-comfortaa">
        <Providers>
          <UtmCapturer />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { UtmCapturer } from "@/src/app/tracking";

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
    <html lang="fr">
      <body className="antialiased font-sans">
        <Providers>
          <UtmCapturer />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import { Barlow_Condensed, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { UtmCapturer } from "@/src/app/tracking";

const headingFont = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800", "900"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Sketch Pilot — AI Whiteboard Animation Platform",
  description:
    "Turn any idea into a full faceless YouTube video. No camera. No editing. In 3 minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${headingFont.variable} ${bodyFont.variable} font-body antialiased bg-[#FAFAFA] text-zinc-950 selection:bg-[#F59E0B]/20 selection:text-[#F59E0B]`}>
        <Providers>
          <UtmCapturer />
          {children}
        </Providers>
      </body>
    </html>
  );
}

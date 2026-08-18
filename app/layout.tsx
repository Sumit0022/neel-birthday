import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const cursive = localFont({ src: "./fonts/FeelingPassionate.ttf", variable: "--font-cursive" });
const handwriting = Caveat({ subsets: ["latin"], variable: "--font-handwriting" });

export const metadata: Metadata = {
  title: "Happy Birthday Neel",
  description: "A cinematic birthday celebration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cursive.variable} ${handwriting.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

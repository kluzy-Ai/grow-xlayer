import type { Metadata } from "next";
import { Baloo_2, DM_Sans, DM_Mono } from "next/font/google";
import { Web3Provider } from "@/components/web3-provider";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Grow — AI Token Giveaways on X Layer",
  description: "AI-powered token giveaway platform deployed on X Layer (OKX EVM L2). Plan giveaways, collect wallets via Telegram, and execute batch distributions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baloo2.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#B4E23F] text-[#15121F] selection:bg-[#F6C61A] selection:text-[#15121F]">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}



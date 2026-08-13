import React from "react";
import Link from "next/link";
import { ArrowRight, Globe, Send, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Mascot } from "@/components/mascot";

export default function DownloadPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 text-center my-auto">
        <div className="bg-white rounded-[40px] p-8 sm:p-14 border-4 border-[#15121F] shadow-2xl space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#F6C61A] text-[#15121F] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase border border-[#15121F]/10">
            <Globe className="w-4 h-4 text-[#15121F]" />
            <span>Web3 Web Application</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#15121F]">
            Access Grow Directly in Your Browser
          </h1>

          <p className="text-lg text-[#15121F]/70 font-medium max-w-lg mx-auto">
            No app store download required! Access the full Grow Web3 Creator Dashboard & Telegram Bot simulator directly on desktop or mobile.
          </p>

          <div className="flex justify-center">
            <Mascot pose="celebrate" size={200} />
          </div>

          {/* Direct Web3 CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="btn-pill btn-grow-primary px-8 py-4 text-base w-full sm:w-auto shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Launch Creator Dashboard</span>
            </Link>
            <Link
              href="/login"
              className="btn-pill bg-[#15121F] text-white hover:bg-[#2A2438] px-8 py-4 text-base w-full sm:w-auto shadow-md flex items-center justify-center gap-2"
            >
              <span>Creator Sign In</span>
            </Link>
          </div>

          <div className="pt-4 text-xs text-[#15121F]/60 font-mono">
            Optimized for OKX Wallet, MetaMask & Mobile Web Browsers on X Layer (Chain ID 1952)
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

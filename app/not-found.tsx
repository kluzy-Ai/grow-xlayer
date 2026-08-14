"use client";

import React from "react";
import Link from "next/link";
import { Home, LayoutDashboard, ArrowRight, AlertTriangle, Compass } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-28 pb-20 max-w-xl mx-auto px-4 sm:px-6 my-auto w-full">
        <div className="bg-white rounded-[40px] p-8 sm:p-12 border-4 border-[#15121F] shadow-[12px_12px_0px_0px_#15121F] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Mascot Coin & 404 Display Badge */}
          <div className="relative inline-block">
            {/* Animated Gold Coin Mascot Container */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#F6C61A] border-4 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] mx-auto flex items-center justify-center relative animate-bounce">
              <span className="text-4xl sm:text-5xl select-none">🪙</span>
              {/* Mascot Grin Badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#7C5CFA] text-white p-2 rounded-2xl border-2 border-[#15121F] shadow-sm">
                <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "8s" }} />
              </div>
            </div>

            {/* Giant 404 Text */}
            <h1 className="font-display font-extrabold text-7xl sm:text-8xl text-[#15121F] tracking-tighter mt-4 leading-none">
              404
            </h1>
          </div>

          {/* Error Message & Friendly Copywriter Text */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#F4F6F0] px-4 py-1.5 rounded-full border-2 border-[#15121F] text-xs font-extrabold text-[#15121F] shadow-[2px_2px_0px_0px_#15121F]">
              <AlertTriangle className="w-4 h-4 text-[#F6C61A] fill-[#F6C61A]" />
              <span>Page Not Found on X Layer</span>
            </div>
            
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#15121F] tracking-tight">
              Oops! This Page Got Airdropped Away!
            </h2>
            <p className="text-xs sm:text-sm text-[#15121F]/80 font-semibold max-w-md mx-auto leading-relaxed">
              The route you’re looking for doesn’t exist or has been moved to a different wallet coordinate. Don't worry, your coins are safe!
            </p>
          </div>

          {/* Quick Helpful Navigation Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/"
              className="w-full sm:w-1/2 py-4 px-6 rounded-full bg-[#15121F] hover:bg-[#2A2438] text-white font-extrabold text-xs sm:text-sm border-3 border-[#B4E23F] shadow-[4px_4px_0px_0px_#1FAE52] transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-[#F6C61A]" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-1/2 py-4 px-6 rounded-full bg-[#1FAE52] hover:bg-[#189645] text-white font-extrabold text-xs sm:text-sm border-3 border-[#15121F] shadow-[4px_4px_0px_0px_#15121F] transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

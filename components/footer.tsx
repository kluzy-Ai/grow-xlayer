import React from "react";
import Link from "next/link";
import { Coins, ArrowRight } from "lucide-react";
import { Mascot } from "./mascot";

interface FooterProps {
  showCtaBanner?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showCtaBanner = true }) => {
  return (
    <footer className="bg-[#B4E23F] pt-12 pb-12 border-t-2 border-[#15121F]/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer CTA Banner (Shown only when showCtaBanner is true) */}
        {showCtaBanner && (
          <div className="bg-[#15121F] text-white rounded-[40px] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-[#F6C61A] text-[#15121F] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  READY TO TRANSFER?
                </div>

                <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  Safely Send Tokens to Your Community Today
                </h2>

                <p className="text-base sm:text-lg text-white/80 font-medium max-w-xl mx-auto lg:mx-0">
                  Join Web3 creators launching fast, AI-planned, 100% onchain verified token drops on X Layer.
                </p>

                {/* Action Button */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/register"
                    className="btn-pill bg-white text-[#15121F] hover:bg-[#F4F6F0] px-8 py-4 text-lg font-extrabold border-2 border-white shadow-md flex items-center justify-center"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>

              {/* Right Mascot & QR Widget */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative">
                  <Mascot pose="celebrate" size={220} />
                  
                  {/* QR Code Card */}
                  <div className="absolute -bottom-4 right-0 bg-white text-[#15121F] p-3 rounded-2xl border-2 border-[#15121F] shadow-xl flex items-center gap-3 hidden sm:flex">
                    <div className="w-14 h-14 bg-[#15121F] rounded-lg p-1.5 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-display font-extrabold text-xs">Grow Web3</div>
                      <div className="text-[10px] text-[#15121F]/70 font-medium">X Layer (1952)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation & Legal Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#15121F]/10 text-sm font-semibold text-[#15121F]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F6C61A] border-2 border-[#15121F] flex items-center justify-center text-sm font-extrabold font-display text-[#15121F]">
              <Coins className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-[#15121F]">
              Grow
            </span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-[#15121F]/80">
            <Link href="/#how-it-works" className="hover:text-[#1FAE52] transition-colors">
              How it works
            </Link>
            <Link href="/login" className="hover:text-[#1FAE52] transition-colors">
              Creator Sign In
            </Link>
            <Link href="/register" className="hover:text-[#1FAE52] transition-colors">
              Register Account
            </Link>
            <Link href="/faq" className="hover:text-[#1FAE52] transition-colors">
              FAQ
            </Link>
            <Link href="/terms" className="hover:text-[#1FAE52] transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-[#1FAE52] transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-[#15121F]/60 font-medium">
            © 2026 Grow Inc. Powered by X Layer.
          </div>
        </div>
      </div>
    </footer>
  );
};

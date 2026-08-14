"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Coins, Rocket, ArrowRight, Copy, Bot, Check } from "lucide-react";
import { Mascot } from "./mascot";

const TYPEWRITER_PHRASES = [
  "Send Tokens to Your Community",
  "Drop OKB Rewards on X Layer",
  "Airdrop Crypto via Telegram",
  "Reward Verified Guild Members",
];

export const Hero: React.FC = () => {
  const [displayText, setDisplayText] = useState(TYPEWRITER_PHRASES[0]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    // Wait for 2.5s on full sentence load before deleting
    if (isWaiting) {
      const waitTimer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, 2500);
      return () => clearTimeout(waitTimer);
    }

    const currentPhrase = TYPEWRITER_PHRASES[phraseIdx];
    const typingSpeed = isDeleting ? 30 : 65;

    const timer = setTimeout(() => {
      if (isDeleting) {
        setDisplayText((prev) => prev.slice(0, prev.length - 1));
        if (displayText.length <= 1) {
          setIsDeleting(false);
          const nextIdx = (phraseIdx + 1) % TYPEWRITER_PHRASES.length;
          setPhraseIdx(nextIdx);
        }
      } else {
        const nextChar = currentPhrase.slice(0, displayText.length + 1);
        setDisplayText(nextChar);
        if (nextChar === currentPhrase) {
          setIsWaiting(true);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, isWaiting, phraseIdx]);

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-[#B4E23F]">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8FCB1F]/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            {/* Inline Badges Heading */}
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#15121F]/10 shadow-sm mb-2">
              <span className="w-5 h-5 rounded-full bg-[#1FAE52] text-white flex items-center justify-center text-xs font-bold">
                <Zap className="w-3 h-3 fill-current" />
              </span>
              <span className="text-sm font-semibold text-[#15121F]">
                Powered by OKX X Layer (Chain ID 1952)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#7C5CFA] text-white font-bold">
                AI Native
              </span>
            </div>

            {/* Headline with Smooth Typewriter Effect */}
            <div className="min-h-[150px] sm:min-h-[170px] lg:min-h-[210px] flex flex-col justify-center">
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#15121F] leading-[1.15]">
                Safely & Quickly{" "}
                <span className="inline-flex items-center gap-1.5 align-middle mx-1">
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#F6C61A] text-[#15121F] shadow-md border-2 border-[#15121F]">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#7C5CFA] text-white shadow-md border-2 border-[#15121F]">
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </span>
                </span>
                <br />
                <span className="inline-block text-[#15121F]">
                  {displayText}
                  <span className="animate-pulse text-[#7C5CFA] font-mono ml-1 inline-block">|</span>
                </span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-[#15121F]/80 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              No spreadsheets, no manual wallet collection, no sybil risks. Plan token giveaways with AI, collect verified wallets via Telegram, and execute instant batch drops on X Layer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/login"
                className="btn-pill btn-grow-primary px-8 py-4 text-lg sm:text-xl group w-full sm:w-auto shadow-xl flex items-center justify-center gap-2"
              >
                <span>Launch App Dashboard</span>
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>

              <Link
                href="#how-it-works"
                className="btn-pill bg-white text-[#15121F] hover:bg-[#F4F6F0] px-7 py-4 text-lg border-2 border-[#15121F] w-full sm:w-auto shadow-md"
              >
                How It Works
              </Link>
            </div>

            {/* Quick Stats Strip */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-[#15121F]/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1FAE52] animate-pulse" />
                <span>180K Community Wallets</span>
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-[#15121F]">$2.4M+</span> Tokens Dropped
              </div>
            </div>
          </div>

          {/* Right Column: Floating Phone Mockup Visual */}
          <div className="lg:col-span-6 relative flex items-center justify-center pt-6 lg:pt-0">
            {/* Ambient Shadow glow */}
            <div className="absolute inset-0 bg-[#8FCB1F] rounded-full blur-3xl opacity-50 transform scale-90" />

            {/* Phone Frames Container */}
            <div className="relative w-full max-w-[540px] flex items-center justify-center overflow-x-hidden p-1 sm:p-2">
              {/* Phone 1: Onboarding Screen (Left, slightly tilted) */}
              <div className="relative z-20 w-[195px] min-[400px]:w-[240px] sm:w-[270px] bg-[#15121F] p-2.5 sm:p-3 rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 border-[#15121F] transform -rotate-6 hover:rotate-0 transition-transform duration-500 shrink-0">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-3.5 sm:h-4 bg-[#15121F] rounded-full z-30" />

                <div className="bg-[#B4E23F] rounded-[28px] sm:rounded-[32px] pt-8 px-3.5 sm:px-4 pb-5 sm:pb-6 flex flex-col items-center text-center overflow-hidden border border-[#15121F]/20 min-h-[420px] sm:min-h-[480px]">
                  <div className="my-auto animate-mascot-bob">
                    <Mascot pose="arrow" size={160} className="sm:hidden" />
                    <Mascot pose="arrow" size={200} className="hidden sm:block" />
                  </div>

                  <div className="w-full space-y-2.5 sm:space-y-3 mt-auto">
                    <h3 className="font-display font-extrabold text-base sm:text-xl text-[#15121F] leading-tight">
                      Airdrop Tokens Safely & Fast
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#15121F]/70 font-medium">
                      Collect wallets via Telegram, drop with AI.
                    </p>

                    <Link
                      href="/login"
                      className="w-full btn-pill btn-grow-primary py-2 sm:py-2.5 text-xs text-white font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-md"
                    >
                      <span>Create Campaign</span>
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Phone 2: Dashboard Screen (Right, overlapping) */}
              <div className="relative z-30 w-[205px] min-[400px]:w-[250px] sm:w-[280px] bg-[#15121F] p-2.5 sm:p-3 rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 border-[#15121F] transform rotate-3 -ml-10 min-[400px]:-ml-16 sm:-ml-20 mt-10 sm:mt-12 hover:rotate-0 transition-transform duration-500 shrink-0">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#15121F] rounded-full z-30" />

                <div className="bg-[#B4E23F] rounded-[32px] pt-8 px-3.5 pb-5 space-y-3 text-[#15121F] border border-[#15121F]/20 min-h-[480px]">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm">BuildX Guild</span>
                    <span className="text-xs bg-white/80 p-1 rounded-full border border-[#15121F]/10 text-[#15121F]">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </div>

                  {/* Treasury Card */}
                  <div className="bg-white rounded-2xl p-3 shadow-md border border-[#15121F]/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#15121F]/60 font-medium">
                      <span>X Layer Treasury</span>
                      <span className="bg-[#1FAE52]/10 text-[#1FAE52] px-1.5 py-0.5 rounded-full font-bold">
                        Chain ID 1952
                      </span>
                    </div>
                    <div className="font-display font-extrabold text-2xl text-[#15121F]">
                      12.50 OKB
                    </div>
                    <div className="bg-[#F4F6F0] rounded-xl px-2 py-1 flex items-center justify-between text-[9px] font-mono text-[#15121F]/70">
                      <span className="truncate">t.me/GrowBot?start=cmp...</span>
                      <Copy className="w-3 h-3 text-[#15121F]/50" />
                    </div>
                  </div>

                  {/* 3 Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-[#1FAE52] text-white p-2 rounded-xl text-center shadow-sm flex flex-col items-center justify-center">
                      <Rocket className="w-3.5 h-3.5 mb-0.5" />
                      <div className="text-[10px] font-bold">Campaign</div>
                    </div>
                    <div className="bg-[#F6C61A] text-[#15121F] p-2 rounded-xl text-center shadow-sm flex flex-col items-center justify-center">
                      <Bot className="w-3.5 h-3.5 mb-0.5" />
                      <div className="text-[10px] font-bold">AI Plan</div>
                    </div>
                    <div className="bg-[#7C5CFA] text-white p-2 rounded-xl text-center shadow-sm flex flex-col items-center justify-center">
                      <Zap className="w-3.5 h-3.5 mb-0.5 fill-current" />
                      <div className="text-[10px] font-bold">Batch Drop</div>
                    </div>
                  </div>

                  {/* Activity Feed Mini */}
                  <div className="bg-white rounded-2xl p-2.5 shadow-sm space-y-2 text-[10px]">
                    <div className="font-bold text-[#15121F]">Recent Batch Drops</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#1FAE52] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <div className="font-bold">20 Wallets Paid</div>
                          <div className="text-[8px] text-[#15121F]/60">5.0 OKB Sent</div>
                        </div>
                      </div>
                      <span className="text-[8px] text-[#15121F]/50">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

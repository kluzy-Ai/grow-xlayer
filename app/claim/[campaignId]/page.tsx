"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Gift, Send, CheckCircle, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ClaimPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const [handle, setHandle] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim() || !wallet.trim()) return;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-32 pb-20 max-w-lg mx-auto px-4 sm:px-6 my-auto w-full">
        <div className="bg-white rounded-[40px] p-8 border-4 border-[#15121F] shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#F6C61A] border-2 border-[#15121F] text-[#15121F] flex items-center justify-center mx-auto shadow-md">
              <Gift className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="font-display font-extrabold text-3xl text-[#15121F]">
              Claim Token Airdrop
            </h1>
            <p className="text-xs text-[#15121F]/70 font-medium">
              Campaign ID: <span className="font-mono font-bold">{params.campaignId || "cmp_xlayer1"}</span>
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  Telegram Handle / Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none"
                    placeholder="@yourhandle"
                  />
                  <User className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                  X Layer EVM Wallet Address
                </label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-mono text-xs text-[#15121F] focus:border-[#15121F] focus:outline-none"
                  placeholder="0x..."
                />
              </div>

              {/* Frictionless Security Guarantee */}
              <div className="p-3 bg-[#1FAE52]/10 rounded-2xl border border-[#1FAE52]/30 text-xs text-[#15121F]/80 font-medium flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1FAE52] shrink-0 mt-0.5" />
                <span><strong>Frictionless Claim:</strong> No account, email, or password required for community claimers!</span>
              </div>

              <button
                type="submit"
                className="w-full btn-pill btn-grow-primary py-4 text-base font-extrabold text-white shadow-xl flex items-center justify-center gap-2"
              >
                <span>Submit Wallet for Airdrop</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-[#1FAE52]/20 border-2 border-[#1FAE52] text-[#1FAE52] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-2xl text-[#15121F]">
                  Wallet Registered!
                </h3>
                <p className="text-xs text-[#15121F]/70 max-w-xs mx-auto font-medium">
                  Your address <span className="font-mono font-bold text-[#15121F]">{wallet.slice(0, 8)}...{wallet.slice(-6)}</span> is submitted for this campaign batch payout.
                </p>
              </div>

              <Link
                href="/"
                className="btn-pill bg-[#15121F] text-white hover:bg-[#2A2438] px-6 py-3 text-xs font-bold inline-flex items-center gap-2 shadow-md"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

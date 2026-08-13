"use client";

import React, { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Grow?",
      a: "Grow is an AI-powered, frictionless token giveaway and community distribution platform built natively on OKX X Layer (EVM L2). It allows Web3 creators to collect verified community wallets via Telegram and execute instant batch payouts onchain.",
    },
    {
      q: "Which networks and tokens are supported?",
      a: "Grow is deployed natively on OKX X Layer Testnet (Chain ID 1952) and Mainnet (Chain ID 196). It supports native OKB, USDT, USDC, and standard ERC-20 tokens.",
    },
    {
      q: "Do community members need an account to claim tokens?",
      a: "No! Only campaign creators sign up / sign in with accounts to safeguard treasury wallets. Community claimers require zero account registration or password creation — they simply submit their EVM address via Telegram or claim link.",
    },
    {
      q: "How does the AI Distribution Command Engine work?",
      a: "The AI agent parses natural language distribution commands (e.g. 'distribute 0.25 OKB to 20 random eligible wallets') into a structured JSON plan, validates it against your treasury balance, and generates a batch transfer for your wallet approval. The AI never touches funds directly.",
    },
    {
      q: "Are there any hidden platform fees?",
      a: "No. Grow charges 0% platform overhead. You only pay standard X Layer L2 network gas fees, which cost less than a fraction of a cent per transaction.",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      <section className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 my-auto w-full flex-1">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border border-[#15121F]/10">
            <HelpCircle className="w-4 h-4 text-[#15121F]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#15121F]">
            Got Questions? We Have Answers.
          </h1>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border-2 border-[#15121F] overflow-hidden shadow-md transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-6 font-display font-extrabold text-lg sm:text-xl text-[#15121F] flex items-center justify-between gap-4 focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className="w-8 h-8 rounded-full bg-[#B4E23F] flex items-center justify-center text-sm font-bold text-[#15121F] shrink-0">
                  {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {openIndex === idx && (
                <div className="px-6 pb-6 text-sm sm:text-base text-[#15121F]/80 font-medium border-t border-[#15121F]/10 pt-4 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

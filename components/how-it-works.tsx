import React from "react";
import { Mascot } from "./mascot";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: "1. Create & Share Campaign Link",
      description:
        "Define token amount per wallet and max spots. Share your generated Telegram link to collect community wallets automatically with zero manual spreadsheet work.",
      pose: "flex" as const,
      accentColor: "bg-[#F6C61A]",
      badgeText: "Step 1",
    },
    {
      title: "2. AI Plans & Validates Drop",
      description:
        "Instruct the AI agent (e.g. 'distribute 0.25 OKB to 20 random wallets'). The AI parses your requirements and validates against treasury balance safely.",
      pose: "thinking" as const,
      accentColor: "bg-[#7C5CFA]",
      badgeText: "Step 2",
    },
    {
      title: "3. Instant Safe Batch Drop on X Layer",
      description:
        "Approve the generated plan with one wallet signature. Tokens are dispatched instantly on X Layer testnet/mainnet with real onchain transaction hash verification.",
      pose: "celebrate" as const,
      accentColor: "bg-[#1FAE52]",
      badgeText: "Step 3",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-[#FFFFFF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 bg-[#F4F6F0] px-4 py-1.5 rounded-full border border-[#15121F]/10 text-xs font-extrabold uppercase tracking-wider text-[#15121F]">
            Simple 3-Step Process
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#15121F] tracking-tight">
            How Grow Works
          </h2>
          <p className="text-lg text-[#15121F]/70 font-medium">
            From Telegram wallet collection to onchain batch payout in 3 quick, secure steps.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#F4F6F0] rounded-[32px] p-8 border-2 border-[#15121F]/10 hover:border-[#15121F] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col items-center text-center relative group"
            >
              {/* Step Number Pill */}
              <div
                className={`absolute -top-4 px-4 py-1 rounded-full text-xs font-display font-black text-[#15121F] border-2 border-[#15121F] shadow-sm ${step.accentColor}`}
              >
                {step.badgeText}
              </div>

              {/* Mascot Pose Illustration */}
              <div className="w-48 h-48 my-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Mascot pose={step.pose} size={180} />
              </div>

              {/* Step Title */}
              <h3 className="font-display font-extrabold text-2xl text-[#15121F] mt-2 mb-3">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-base text-[#15121F]/75 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

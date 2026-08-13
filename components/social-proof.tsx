import React from "react";

export const SocialProof: React.FC = () => {
  const stats = [
    { label: "Tokens Distributed", value: "$2.4M+", accent: "text-[#F6C61A]" },
    { label: "Community Wallets", value: "180K+", accent: "text-[#1FAE52]" },
    { label: "Onchain Verification", value: "100%", accent: "text-[#F6C61A]" },
    { label: "Platform Fee", value: "0.00%", accent: "text-[#7C5CFA]" },
  ];

  return (
    <section className="bg-[#15121F] text-white py-16 lg:py-20 border-y-4 border-[#15121F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {stats.map((stat, idx) => (
            <div key={idx} className={`space-y-2 ${idx > 0 ? "pt-6 lg:pt-0" : ""}`}>
              <div className={`font-display font-extrabold text-4xl sm:text-5xl tracking-tight ${stat.accent}`}>
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";

import React, { useState, useEffect } from "react";

export const DashboardPreview: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(0.612);
  const [streakPoints, setStreakPoints] = useState(2.80);
  const [activeTab, setActiveTab] = useState<"all" | "received" | "sent">("all");
  const [claimedToday, setClaimedToday] = useState(false);

  // Simulated countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 55, seconds: 52 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("0v8d884v06dv4ed5vv5vd4v6hyj6");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = () => {
    if (!claimedToday) {
      setBalance((prev) => parseFloat((prev + 0.005).toFixed(4)));
      setStreakPoints((prev) => parseFloat((prev + 10).toFixed(2)));
      setClaimedToday(true);
    }
  };

  const activities = [
    {
      type: "received",
      title: "Received Daily Streak Bonus",
      amount: "+0.0050 BTC",
      time: "Just now",
      color: "bg-[#F6C61A]",
      icon: "🪙",
      isNew: claimedToday,
    },
    {
      type: "received",
      title: "Received Play Reward",
      amount: "+0.0250 BTC",
      time: "2 hours ago",
      color: "bg-[#F6C61A]",
      icon: "🪙",
    },
    {
      type: "sent",
      title: "Sent to Wallet",
      amount: "-0.0100 BTC",
      time: "1 day ago",
      color: "bg-[#F7931A]",
      icon: "↗️",
    },
    {
      type: "received",
      title: "Referral Bonus (Alex)",
      amount: "+0.0001 BTC",
      time: "2 days ago",
      color: "bg-[#1FAE52]",
      icon: "👥",
    },
    {
      type: "received",
      title: "Offer Completed: Puzzle #4",
      amount: "+0.0002 BTC",
      time: "2 days ago",
      color: "bg-[#7C5CFA]",
      icon: "👑",
    },
  ];

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "received") return act.type === "received";
    if (activeTab === "sent") return act.type === "sent";
    return true;
  });

  return (
    <section id="dashboard-preview" className="py-20 lg:py-32 bg-[#F4F6F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#B4E23F] px-4 py-1.5 rounded-full border border-[#15121F]/10 text-xs font-extrabold uppercase tracking-wider text-[#15121F]">
            Interactive App Preview
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#15121F] tracking-tight">
            See Your Real-Time Dashboard
          </h2>
          <p className="text-lg text-[#15121F]/70 font-medium">
            Try clicking the interactive buttons below to test claiming rewards and copying your BTC address!
          </p>
        </div>

        {/* Dashboard Frame Mockup */}
        <div className="max-w-2xl mx-auto bg-[#B4E23F] p-4 sm:p-6 rounded-[44px] border-4 border-[#15121F] shadow-2xl space-y-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-[#15121F] flex items-center justify-center font-bold text-lg shadow-sm">
                👤
              </div>
              <div>
                <h4 className="font-display font-extrabold text-lg text-[#15121F]">
                  Hello, Richard!
                </h4>
                <p className="text-xs text-[#15121F]/70 font-medium">Pro Streak Level 4</p>
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={claimedToday}
              className={`btn-pill px-4 py-2 text-xs font-extrabold shadow-sm ${
                claimedToday
                  ? "bg-white/60 text-[#15121F]/50 cursor-not-allowed border border-[#15121F]/10"
                  : "btn-grow-primary animate-bounce"
              }`}
            >
              {claimedToday ? "✓ Claimed Today" : "🎁 Claim Daily +0.005 BTC"}
            </button>
          </div>

          {/* Stat Card: Total Earnings */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#15121F]/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#15121F]/60">
                Total Earnings
              </span>
              <div className="flex items-center gap-1.5 bg-[#1FAE52]/10 text-[#1FAE52] px-3 py-1 rounded-full text-xs font-extrabold border border-[#1FAE52]/20">
                <span>📈</span>
                <span>+6.23% (+0.003 BTC)</span>
              </div>
            </div>

            <div className="font-display font-extrabold text-4xl sm:text-5xl text-[#15121F] tracking-tight">
              {balance.toFixed(3)} <span className="text-[#F7931A]">BTC</span>
            </div>

            {/* Address bar */}
            <div className="bg-[#F4F6F0] rounded-2xl p-3 flex items-center justify-between gap-2 border border-[#15121F]/10">
              <span className="font-mono text-xs text-[#15121F]/80 truncate">
                0v8d884v06dv4ed5vv5vd4v6hyj6...
              </span>
              <button
                onClick={handleCopy}
                className="btn-pill bg-white text-[#15121F] px-3 py-1 text-xs border border-[#15121F]/20 hover:bg-[#B4E23F]/30 active:scale-95 transition-all"
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

          {/* 3 Pill Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button className="btn-pill btn-grow-primary py-3.5 flex flex-col items-center gap-1 text-white shadow-md hover:scale-102 transition-transform">
              <span className="text-xl">🏠</span>
              <span className="text-sm font-extrabold">Start</span>
            </button>
            <button className="btn-pill btn-grow-gold py-3.5 flex flex-col items-center gap-1 text-[#15121F] shadow-md hover:scale-102 transition-transform">
              <span className="text-xl">💳</span>
              <span className="text-sm font-extrabold">Withdraw</span>
            </button>
            <button className="btn-pill btn-grow-violet py-3.5 flex flex-col items-center gap-1 text-white shadow-md hover:scale-102 transition-transform">
              <span className="text-xl">👥</span>
              <span className="text-sm font-extrabold">Friends</span>
            </button>
          </div>

          {/* Streak Bar Card */}
          <div className="bg-[#15121F] text-white p-5 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#7C5CFA] flex items-center justify-center text-xs">
                  ✨
                </span>
                <span className="font-extrabold font-display text-base">
                  {streakPoints.toFixed(2)} / 120 points
                </span>
              </div>
              <span className="font-mono text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-full">
                ⏳ {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")} Left
              </span>
            </div>

            <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-[#F6C61A] via-[#1FAE52] to-[#7C5CFA] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (streakPoints / 120) * 100)}%` }}
              />
            </div>
          </div>

          {/* Activity Feed Container */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#15121F]/10 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-lg text-[#15121F]">
                Recent Activity
              </h4>
              <div className="flex gap-1 text-xs bg-[#F4F6F0] p-1 rounded-full border border-[#15121F]/10 font-bold">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "all" ? "bg-[#15121F] text-white" : "text-[#15121F]/70"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("received")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "received" ? "bg-[#15121F] text-white" : "text-[#15121F]/70"
                  }`}
                >
                  Received
                </button>
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "sent" ? "bg-[#15121F] text-white" : "text-[#15121F]/70"
                  }`}
                >
                  Sent
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[#15121F]/10">
              {filteredActivities.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-lg border-2 border-[#15121F] shadow-sm`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#15121F] flex items-center gap-2">
                        {item.title}
                        {item.isNew && (
                          <span className="text-[10px] bg-[#1FAE52] text-white px-1.5 py-0.5 rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#15121F]/60 font-mono font-medium">
                        {item.amount}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-[#15121F]/50 font-medium">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

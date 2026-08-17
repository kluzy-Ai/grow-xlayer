"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  Layers,
  ArrowRight,
  Loader2,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { CampaignIntent, AiCampaignResponse, ValidationIssue } from "@/lib/ai-agent";

interface AiCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: any) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export const AiCampaignModal: React.FC<AiCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [promptInput, setPromptInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Chat conversation history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Hello! I am your Grow AI Campaign Copilot. Tell me what kind of token giveaway or airdrop campaign you want to launch on OKX X Layer.",
      timestamp: "Just now",
    },
  ]);

  // Current AI-generated campaign state
  const [campaign, setCampaign] = useState<CampaignIntent>({
    title: "USDT Community Giveaway",
    description: "Natural language campaign configured for OKX X Layer",
    network: "OKX X Layer Testnet (Chain ID 1952)",
    token: "USDT",
    totalBudget: 5000,
    recipientCount: 1000,
    rewardPerRecipient: 5,
    distributionType: "fixed",
  });

  // Current validation status
  const [validation, setValidation] = useState<AiCampaignResponse["validation"]>({
    valid: true,
    issues: [],
    calculatedTotalRequired: 5000,
  });

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend?: string) => {
    const query = (textToSend || promptInput).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setPromptInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          currentCampaign: campaign,
          conversationHistory: chatMessages,
        }),
      });

      const data: AiCampaignResponse = await res.json();

      if (data.campaign) {
        setCampaign(data.campaign);
      }
      if (data.validation) {
        setValidation(data.validation);
      }

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.assistantMessage || "Campaign preview updated. Check the right panel for live validation.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Agent request error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: "I encountered a network error processing that prompt. Your previous parameters are preserved.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResolution = (actionPrompt: string) => {
    handleSendPrompt(actionPrompt);
  };

  const handleLaunchCampaign = () => {
    const slug = "cmp_" + Math.random().toString(36).substring(2, 8);
    const campaignName = campaign.title.trim() || "AI Campaign";
    const finalCampaign = {
      id: slug,
      title: campaignName,
      name: campaignName,
      totalPool: Number(campaign.totalBudget).toFixed(2),
      token: campaign.token,
      amountType: campaign.distributionType,
      amountPerWallet: Number(campaign.rewardPerRecipient),
      maxSpots: Number(campaign.recipientCount),
      telegramLink: `https://t.me/GrowBot?start=${slug}`,
      createdAt: "Just now",
      status: "Active",
    };

    onCreate(finalCampaign);
    onClose();
  };

  const quickPills = [
    "Create a $5,000 USDT campaign for 1,000 wallets, $5 each",
    "Create a 500 OKB giveaway for 100 wallets",
    "Make it 2,000 wallets instead",
    "Change reward to $10",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#15121F]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-[32px] border-4 border-[#15121F] max-w-5xl w-full p-4 sm:p-6 shadow-[12px_12px_0px_0px_#15121F] space-y-6 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-[#15121F] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C5CFA] text-white flex items-center justify-center border-2 border-[#15121F] shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl text-[#15121F]">
                  Grow AI Campaign Copilot
                </h2>
                <span className="bg-[#15121F] text-[#B4E23F] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs font-bold text-[#15121F]/60">
                Natural language campaign creation & validation on OKX X Layer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F4F6F0] text-[#15121F] font-bold border-2 border-[#15121F] hover:bg-[#15121F] hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden flex-1">
          
          {/* Left Column: Conversational AI Chat Workspace */}
          <div className="lg:col-span-7 flex flex-col bg-[#F4F6F0] rounded-2xl border-4 border-[#15121F] p-4 overflow-hidden h-[420px] lg:h-auto">
            
            {/* Quick Pills */}
            <div className="pb-3 border-b-2 border-[#15121F]/10 space-y-1.5 shrink-0">
              <span className="text-[11px] font-extrabold text-[#15121F]/60 uppercase tracking-wider">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(pill)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-[#7C5CFA] hover:text-white text-[#15121F] border border-[#15121F]/20 transition-all cursor-pointer truncate max-w-[220px]"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 border-2 border-[#15121F] text-xs font-medium space-y-1 ${
                      msg.sender === "user"
                        ? "bg-[#7C5CFA] text-white rounded-br-none"
                        : "bg-white text-[#15121F] rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="leading-relaxed font-bold">{msg.text}</p>
                    <span className="text-[9px] opacity-70 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-[#15121F] rounded-2xl p-3 text-xs font-bold text-[#15121F] flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#7C5CFA]" />
                    <span>Gemini AI is analyzing request & checking math...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Natural Language Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="pt-2 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Type your campaign command or edit request..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-[#15121F] text-xs font-bold text-[#15121F] focus:outline-none focus:ring-2 focus:ring-[#7C5CFA]"
              />
              <button
                type="submit"
                disabled={isLoading || !promptInput.trim()}
                className="px-5 py-3 rounded-xl bg-[#15121F] hover:bg-[#2A2438] text-white text-xs font-extrabold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Column: Live AI Campaign Preview Card */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border-4 border-[#15121F] p-4 space-y-4 overflow-y-auto shadow-md">
            
            {/* Card Title & Edit Toggle */}
            <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1FAE52]" />
                <h3 className="font-display font-extrabold text-base text-[#15121F]">
                  AI Campaign Preview
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#7C5CFA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEditing ? "Done Editing" : "Edit Parameters"}</span>
              </button>
            </div>

            {/* Campaign Parameters Display / Inputs */}
            <div className="space-y-3 bg-[#F4F6F0] p-3.5 rounded-xl border-2 border-[#15121F]/10 text-xs">
              <div>
                <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block mb-1">
                  Campaign Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={campaign.title}
                    onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#15121F] font-bold text-[#15121F]"
                  />
                ) : (
                  <div className="font-extrabold text-[#15121F] text-sm">{campaign.title}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block mb-1">
                    Network
                  </label>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-[#15121F] text-[#B4E23F] font-extrabold text-[11px]">
                    OKX X Layer
                  </span>
                </div>

                <div>
                  <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block mb-1">
                    Token
                  </label>
                  {isEditing ? (
                    <select
                      value={campaign.token}
                      onChange={(e) => setCampaign({ ...campaign, token: e.target.value })}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-[#15121F] font-bold"
                    >
                      <option value="OKB">OKB</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                    </select>
                  ) : (
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#7C5CFA] text-white font-extrabold text-[11px]">
                      {campaign.token}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#15121F]/10">
                <div>
                  <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block">
                    Budget
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={campaign.totalBudget}
                      onChange={(e) => setCampaign({ ...campaign, totalBudget: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-[#15121F] font-bold"
                    />
                  ) : (
                    <div className="font-extrabold text-[#15121F] text-xs sm:text-sm">
                      {campaign.totalBudget} {campaign.token}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block">
                    Recipients
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={campaign.recipientCount}
                      onChange={(e) => setCampaign({ ...campaign, recipientCount: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-[#15121F] font-bold"
                    />
                  ) : (
                    <div className="font-extrabold text-[#15121F] text-xs sm:text-sm">
                      {campaign.recipientCount} Wallets
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block">
                    Reward / Wallet
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={campaign.rewardPerRecipient}
                      onChange={(e) => setCampaign({ ...campaign, rewardPerRecipient: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-[#15121F] font-bold"
                    />
                  ) : (
                    <div className="font-extrabold text-[#15121F] text-xs sm:text-sm">
                      {campaign.rewardPerRecipient} {campaign.token}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Checklist & Issue Banners */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-[#15121F]/60 uppercase tracking-wider block">
                Validation Checklist:
              </span>

              {validation.issues.length === 0 ? (
                <div className="space-y-1.5 text-xs font-bold">
                  <div className="flex items-center gap-2 text-[#1FAE52]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Budget Verified ({campaign.recipientCount} × {campaign.rewardPerRecipient} = {campaign.totalBudget} {campaign.token})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1FAE52]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Network & Token Supported (OKX X Layer / {campaign.token})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1FAE52]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mathematical Allocation Valid</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {validation.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FFF2F2] border-2 border-[#15121F] rounded-xl p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-start gap-2 text-red-600 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{issue.message}</span>
                      </div>

                      {/* Resolution options buttons if budget mismatch */}
                      {issue.resolutionOptions && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-extrabold text-[#15121F] uppercase block">
                            Suggested Quick Fixes:
                          </span>
                          {issue.resolutionOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => handleApplyResolution(opt.actionPrompt)}
                              className="w-full text-left px-3 py-1.5 rounded-lg bg-white hover:bg-[#7C5CFA] hover:text-white border border-[#15121F] text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              → {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Campaign Confirmation CTA */}
            <div className="pt-2">
              <button
                onClick={handleLaunchCampaign}
                disabled={!validation.valid || campaign.totalBudget <= 0 || campaign.recipientCount <= 0}
                className="w-full py-3.5 rounded-xl bg-[#1FAE52] hover:bg-[#199645] text-white font-display font-extrabold text-sm border-2 border-[#15121F] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

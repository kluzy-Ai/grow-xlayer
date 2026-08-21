"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Loader2,
  Sliders,
  ShieldCheck,
  Sparkles,
  Bot,
  Layers,
  HelpCircle,
} from "lucide-react";
import { CampaignIntent, AiCampaignResponse, ValidationIssue } from "@/lib/ai-agent";
import { createClient } from "@/lib/supabase/client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Chat conversation history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Hello! I am your Grow AI Campaign Copilot. Tell me what kind of token giveaway or airdrop campaign you want to launch on OKX X Layer (e.g. token, budget, spots, or reward per wallet).",
      timestamp: "Just now",
    },
  ]);

  // Current AI-generated campaign state (Starts as null so no hardcoded data is shown)
  const [campaign, setCampaign] = useState<CampaignIntent | null>(null);

  // Current validation status
  const [validation, setValidation] = useState<AiCampaignResponse["validation"] | null>(null);

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
    setSubmitError(null);

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
        text: data.assistantMessage || "I have updated the campaign preview on the right.",
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
          text: "I encountered an error analyzing that prompt. Please try phrasing your request with token amount and recipient count.",
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

  const handleLaunchCampaign = async () => {
    if (!campaign || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const slug = "cmp_" + Math.random().toString(36).substring(2, 9);
      const campaignTitle = campaign.title.trim() || `${campaign.token} Community Giveaway`;
      const totalPool = Number(campaign.totalBudget) || 0;
      const maxSpots = Number(campaign.recipientCount) || 1;
      const amountPerClaim = Number(campaign.rewardPerRecipient) || (totalPool / maxSpots);

      // Insert directly into Supabase database
      const { data: dbData, error: dbError } = await supabase
        .from("campaigns")
        .insert({
          title: campaignTitle,
          slug: slug,
          token_symbol: campaign.token || "OKB",
          total_budget: totalPool,
          max_spots: maxSpots,
          amount_per_claim: amountPerClaim,
          creator_id: user?.id || null,
          status: "active",
        })
        .select()
        .single();

      if (dbError) {
        console.warn("Supabase campaign insert warning (using local fallback):", dbError.message);
      }

      const finalCampaign = {
        id: dbData?.id || slug,
        slug: dbData?.slug || slug,
        title: campaignTitle,
        name: campaignTitle,
        totalPool: totalPool.toFixed(2),
        token: campaign.token || "OKB",
        amountType: campaign.distributionType || "fixed",
        amountPerWallet: amountPerClaim,
        maxSpots: maxSpots,
        telegramLink: `https://t.me/GrowXlayerbot?start=${slug}`,
        createdAt: "Just now",
        status: "Active",
      };

      onCreate(finalCampaign);
      onClose();
    } catch (err: any) {
      console.error("Failed to launch AI campaign:", err);
      setSubmitError(err?.message || "Failed to save campaign to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPills = [
    "Create a 500 OKB giveaway for 100 wallets",
    "Launch 1,000 USDT airdrop for 200 users, 5 USDT each",
    "Make it 500 wallets instead",
    "Change reward to 2 OKB per wallet",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#15121F]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border-4 border-[#15121F] max-w-5xl w-full p-4 sm:p-6 shadow-[12px_12px_0px_0px_#15121F] space-y-5 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C5CFA] text-white flex items-center justify-center border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F]">
              <Zap className="w-5 h-5 text-[#B4E23F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#15121F]">
                  Grow AI Campaign Copilot
                </h2>
                <span className="bg-[#15121F] text-[#B4E23F] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Google Gemini
                </span>
              </div>
              <p className="text-xs font-bold text-[#15121F]/60">
                Natural language campaign creation & mathematical validation on OKX X Layer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F4F6F0] text-[#15121F] font-bold border-2 border-[#15121F] hover:bg-[#15121F] hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_0px_#15121F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden flex-1">
          
          {/* Left Column: Conversational AI Chat Workspace */}
          <div className="lg:col-span-7 flex flex-col bg-[#F4F6F0] rounded-2xl border-3 border-[#15121F] p-3.5 sm:p-4 overflow-hidden h-[380px] lg:h-auto">
            
            {/* Quick Prompts Bar */}
            <div className="pb-3 border-b-2 border-[#15121F]/10 space-y-1.5 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#15121F]/60 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#7C5CFA]" />
                <span>Quick Prompts:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(pill)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-[#7C5CFA] hover:text-white text-[#15121F] border border-[#15121F]/20 transition-all cursor-pointer truncate max-w-[240px] shadow-xs active:translate-y-0.5"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 border-2 border-[#15121F] text-xs font-medium space-y-1 ${
                      msg.sender === "user"
                        ? "bg-[#7C5CFA] text-white rounded-br-none shadow-[2px_2px_0px_0px_#15121F]"
                        : "bg-white text-[#15121F] rounded-bl-none shadow-[2px_2px_0px_0px_#15121F]"
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
                  <div className="bg-white border-2 border-[#15121F] rounded-2xl p-3 text-xs font-bold text-[#15121F] flex items-center gap-2 shadow-[2px_2px_0px_0px_#15121F]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#7C5CFA]" />
                    <span>Gemini AI is parsing request & checking allocation math...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Natural Language Prompt Input Bar */}
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
                placeholder="e.g. Create 500 OKB giveaway for 100 wallets, 5 OKB each..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-[#15121F] text-xs font-bold text-[#15121F] focus:outline-none focus:ring-2 focus:ring-[#7C5CFA] shadow-xs"
              />
              <button
                type="submit"
                disabled={isLoading || !promptInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#15121F] hover:bg-[#2A2438] text-white text-xs font-extrabold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-[2px_2px_0px_0px_#15121F] active:translate-y-0.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-[#B4E23F]" />
              </button>
            </form>
          </div>

          {/* Right Column: Live AI Campaign Preview */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border-3 border-[#15121F] p-4 space-y-4 overflow-y-auto shadow-[4px_4px_0px_0px_#15121F]">
            
            {campaign && campaign.totalBudget > 0 ? (
              <>
                {/* Header & Edit Toggle */}
                <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-2.5">
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
                    <span>{isEditing ? "Done" : "Edit"}</span>
                  </button>
                </div>

                {/* Campaign Parameters Card */}
                <div className="space-y-3 bg-[#F4F6F0] p-3.5 rounded-xl border-2 border-[#15121F] shadow-xs text-xs">
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
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#15121F] text-[#B4E23F] font-extrabold text-[11px] border border-[#15121F]">
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
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#7C5CFA] text-white font-extrabold text-[11px] border border-[#15121F]">
                          {campaign.token}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#15121F]/15">
                    <div>
                      <label className="font-extrabold text-[#15121F]/60 text-[10px] uppercase block">
                        Budget
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={campaign.totalBudget}
                          onChange={(e) => {
                            const newBud = Number(e.target.value);
                            setCampaign({ ...campaign, totalBudget: newBud });
                          }}
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
                          onChange={(e) => {
                            const newRec = Number(e.target.value);
                            setCampaign({ ...campaign, recipientCount: newRec });
                          }}
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
                          onChange={(e) => {
                            const newRew = Number(e.target.value);
                            setCampaign({ ...campaign, rewardPerRecipient: newRew });
                          }}
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

                {/* Validation Checklist & Issues */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-[#15121F]/60 uppercase tracking-wider block">
                    Validation Checklist:
                  </span>

                  {validation && validation.issues.length === 0 ? (
                    <div className="space-y-1.5 text-xs font-bold bg-[#1FAE52]/10 p-3 rounded-xl border-2 border-[#15121F]">
                      <div className="flex items-center gap-2 text-[#1FAE52]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          Budget Verified ({campaign.recipientCount} × {campaign.rewardPerRecipient} = {campaign.totalBudget} {campaign.token})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#1FAE52]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Network Supported (OKX X Layer / {campaign.token})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#1FAE52]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Mathematical Allocation Valid</span>
                      </div>
                    </div>
                  ) : validation?.issues ? (
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

                          {issue.resolutionOptions && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-extrabold text-[#15121F] uppercase block">
                                Quick Fixes:
                              </span>
                              {issue.resolutionOptions.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => handleApplyResolution(opt.actionPrompt)}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#7C5CFA] hover:text-white border border-[#15121F] text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  → {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {submitError && (
                  <div className="p-2.5 bg-red-100 border-2 border-red-500 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Launch Campaign Confirmation CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleLaunchCampaign}
                    disabled={isSubmitting || (validation && !validation.valid) || campaign.totalBudget <= 0 || campaign.recipientCount <= 0}
                    className="w-full py-3.5 rounded-xl bg-[#1FAE52] hover:bg-[#199645] text-white font-display font-extrabold text-sm border-2 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] hover:shadow-[5px_5px_0px_0px_#15121F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Campaign</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Ready / Empty State when no prompt has been sent yet */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-[#B4E23F] border-3 border-[#15121F] flex items-center justify-center shadow-[4px_4px_0px_0px_#15121F]">
                  <Bot className="w-8 h-8 text-[#15121F]" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="font-display font-extrabold text-base text-[#15121F]">
                    AI Copilot Ready
                  </h4>
                  <p className="text-xs font-semibold text-[#15121F]/70 leading-relaxed">
                    Describe your giveaway on the left or tap a quick prompt to generate real-time campaign parameters, token allocation, and validation.
                  </p>
                </div>
                <div className="p-3 bg-[#F4F6F0] rounded-2xl border-2 border-[#15121F]/15 text-[11px] font-bold text-[#15121F]/70 max-w-xs">
                  ⚡ Supports OKB, USDT, and USDC with instant mathematical verification.
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

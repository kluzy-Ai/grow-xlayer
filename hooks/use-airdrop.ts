"use client";

import { useState } from "react";
import { Campaign, WalletSubmission, AIDistributionPlan } from "@/types";
import { generateDistributionPlan } from "@/services/ai-agent";

export function useAirdrop() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<WalletSubmission[]>([]);
  const [aiPlan, setAiPlan] = useState<AIDistributionPlan | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const addSubmission = (newSub: WalletSubmission) => {
    setSubmissions((prev) => {
      const exists = prev.some((s) => s.id === newSub.id || s.address === newSub.address);
      if (exists) return prev;
      return [newSub, ...prev];
    });
  };

  const createPlan = async (prompt: string) => {
    if (!campaign) return;
    setIsAiGenerating(true);
    setTxHash(null);
    try {
      const plan = await generateDistributionPlan(
        prompt,
        submissions,
        campaign.amountPerWallet || 0.25,
        campaign.token || "OKB"
      );
      setAiPlan(plan);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const executeDistribution = async () => {
    if (!aiPlan) return;
    setIsDistributing(true);

    setTimeout(() => {
      const hash =
        "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      setTxHash(hash);
      setIsDistributing(false);

      setSubmissions((prev) =>
        prev.map((sub) => {
          if (aiPlan.recipients.some((r) => r.id === sub.id)) {
            return { ...sub, status: "Paid", txHash: hash };
          }
          return sub;
        })
      );

      if (campaign) {
        setCampaign((prev) => (prev ? { ...prev, status: "Completed" } : null));
      }
    }, 1800);
  };

  return {
    campaign,
    setCampaign,
    submissions,
    setSubmissions,
    addSubmission,
    aiPlan,
    isAiGenerating,
    createPlan,
    executeDistribution,
    isDistributing,
    txHash,
  };
}

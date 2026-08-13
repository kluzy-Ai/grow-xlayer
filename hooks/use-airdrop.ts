"use client";

import { useState } from "react";
import { Campaign, WalletSubmission, AIDistributionPlan } from "@/types";
import { generateDistributionPlan } from "@/services/ai-agent";

export function useAirdrop() {
  const [campaign, setCampaign] = useState<Campaign>({
    id: "cmp_xlayer1",
    name: "BuildX OKB Community Giveaway",
    token: "OKB",
    amountPerWallet: 0.25,
    maxSpots: 20,
    telegramLink: "https://t.me/GrowBot?start=cmp_xlayer1",
    createdAt: "Aug 13, 2026",
    status: "Active",
  });

  const [submissions, setSubmissions] = useState<WalletSubmission[]>([
    {
      id: "sub_1",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      username: "@alex_web3",
      timestamp: "10 mins ago",
      status: "Submitted",
    },
    {
      id: "sub_2",
      address: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
      username: "@crypto_sam",
      timestamp: "8 mins ago",
      status: "Submitted",
    },
    {
      id: "sub_3",
      address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      username: "@dev_elena",
      timestamp: "5 mins ago",
      status: "Submitted",
    },
    {
      id: "sub_4",
      address: "0xfB6916095ca1df60bB79Ce92ce3ea74c37c5d359",
      username: "@michael_okx",
      timestamp: "2 mins ago",
      status: "Submitted",
    },
  ]);

  const [aiPlan, setAiPlan] = useState<AIDistributionPlan | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const addSubmission = (newSub: WalletSubmission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const createPlan = async (prompt: string) => {
    setIsAiGenerating(true);
    setTxHash(null);
    try {
      const plan = await generateDistributionPlan(
        prompt,
        submissions,
        campaign.amountPerWallet,
        campaign.token
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

      setCampaign((prev) => ({ ...prev, status: "Completed" }));
    }, 1800);
  };

  return {
    campaign,
    setCampaign,
    submissions,
    addSubmission,
    aiPlan,
    isAiGenerating,
    createPlan,
    executeDistribution,
    isDistributing,
    txHash,
  };
}

"use client";

import React, { useState } from "react";
import {
  History,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Lock,
} from "lucide-react";

export interface TransactionRecord {
  id: string;
  timestamp: string;
  campaignName: string;
  recipientAddress: string;
  amount: string;
  txHash: string;
  status: "Successful" | "Failed";
  failureReason?: string;
}

export const TransactionHistoryCard: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "successful" | "failed">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRetryingGroup, setIsRetryingGroup] = useState(false);
  const [retriedTxIds, setRetriedTxIds] = useState<Set<string>>(new Set());

  const itemsPerPage = 4;

  // Initial Mock Transaction Records
  const initialTransactions: TransactionRecord[] = [
    {
      id: "tx_101",
      timestamp: "Aug 14, 2026 17:45",
      campaignName: "BuildX OKB Community Giveaway",
      recipientAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      amount: "0.2500 OKB",
      txHash: "0x98f7a2b1c4e6d3f5b7a9c2d1e4f6a8c3d5b7a9c2",
      status: "Successful",
    },
    {
      id: "tx_102",
      timestamp: "Aug 14, 2026 17:45",
      campaignName: "BuildX OKB Community Giveaway",
      recipientAddress: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
      amount: "0.2500 OKB",
      txHash: "0x98f7a2b1c4e6d3f5b7a9c2d1e4f6a8c3d5b7a9c2",
      status: "Successful",
    },
    {
      id: "tx_103",
      timestamp: "Aug 14, 2026 17:45",
      campaignName: "BuildX OKB Community Giveaway",
      recipientAddress: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      amount: "0.2500 OKB",
      txHash: "0x3a2b1c4e6d5f7a9b2c1d4e6f8a3c5d7b9a2c1d4",
      status: "Failed",
      failureReason: "Gas Price Spike",
    },
    {
      id: "tx_104",
      timestamp: "Aug 14, 2026 17:45",
      campaignName: "BuildX OKB Community Giveaway",
      recipientAddress: "0xfB6916095ca1df60bb79Ce92ce3ea74c37c5d359",
      amount: "0.2500 OKB",
      txHash: "0x98f7a2b1c4e6d3f5b7a9c2d1e4f6a8c3d5b7a9c2",
      status: "Successful",
    },
    {
      id: "tx_105",
      timestamp: "Aug 10, 2026 14:20",
      campaignName: "X Layer Guild Airdrop Phase 1",
      recipientAddress: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
      amount: "0.5000 OKB",
      txHash: "0x4a12c8d9e7f3a5b1c9d2e4f6a8c0b2d4e6f8a1c3",
      status: "Successful",
    },
    {
      id: "tx_106",
      timestamp: "Aug 10, 2026 14:20",
      campaignName: "X Layer Guild Airdrop Phase 1",
      recipientAddress: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
      amount: "0.5000 OKB",
      txHash: "0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
      status: "Failed",
      failureReason: "Nonce Mismatch",
    },
    {
      id: "tx_107",
      timestamp: "Aug 05, 2026 09:15",
      campaignName: "OKB Community Growth Fund",
      recipientAddress: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
      amount: "0.1000 OKB",
      txHash: "0x7b34e1a8c9d2e4f6a8c0b2d4e6f8a1c3b5d7e9f0",
      status: "Successful",
    },
    {
      id: "tx_108",
      timestamp: "Aug 05, 2026 09:15",
      campaignName: "OKB Community Growth Fund",
      recipientAddress: "0x8626f69A7B5E75A05B6B630B55f52a8c3d523674",
      amount: "0.1000 OKB",
      txHash: "0x7b34e1a8c9d2e4f6a8c0b2d4e6f8a1c3b5d7e9f0",
      status: "Successful",
    },
  ];

  // Derive current state including retried transactions
  const transactions: TransactionRecord[] = initialTransactions.map((tx) => {
    if (retriedTxIds.has(tx.id)) {
      return {
        ...tx,
        status: "Successful",
        failureReason: undefined,
        txHash: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
      };
    }
    return tx;
  });

  // Filter transactions based on active filter tab
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "successful") return tx.status === "Successful";
    if (filter === "failed") return tx.status === "Failed";
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const successfulCount = transactions.filter((t) => t.status === "Successful").length;
  const failedCount = transactions.filter((t) => t.status === "Failed").length;

  // Single Transaction Manual Retry
  const handleSingleRetry = (txId: string) => {
    setRetriedTxIds((prev) => new Set(prev).add(txId));
  };

  // Group Manual Retry for all failed transactions
  const handleRetryGroup = () => {
    setIsRetryingGroup(true);
    setTimeout(() => {
      const failedIds = transactions.filter((t) => t.status === "Failed").map((t) => t.id);
      setRetriedTxIds((prev) => {
        const updated = new Set(prev);
        failedIds.forEach((id) => updated.add(id));
        return updated;
      });
      setIsRetryingGroup(false);
      setFilter("all");
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border-4 border-[#15121F] shadow-lg space-y-5">
      {/* 1. Header with Card Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#15121F]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7C5CFA] text-white border-2 border-[#15121F] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_#15121F]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#15121F]">
              Transaction History
            </h3>
            <p className="text-xs font-semibold text-[#15121F]/60">
              Paginated ledger of all on-chain batch distributions on X Layer
            </p>
          </div>
        </div>

        {/* Batch Retry Group Action Button */}
        {failedCount > 0 && (
          <button
            onClick={handleRetryGroup}
            disabled={isRetryingGroup}
            className="px-4 py-2.5 rounded-xl bg-[#F6C61A] hover:bg-[#e0b213] text-[#15121F] font-extrabold text-xs border-2 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] transition-transform active:translate-y-0.5 cursor-pointer flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${isRetryingGroup ? "animate-spin text-[#15121F]" : ""}`} />
            <span>{isRetryingGroup ? "Retrying Group..." : `Retry ${failedCount} Failed Batch`}</span>
          </button>
        )}
      </div>

      {/* 2. Filter Tabs (All, Successful, Failed) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#F4F6F0] p-1.5 rounded-2xl border-2 border-[#15121F]/15 font-extrabold text-xs">
          <button
            onClick={() => {
              setFilter("all");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#15121F] text-white shadow-sm"
                : "text-[#15121F]/70 hover:text-[#15121F]"
            }`}
          >
            All ({transactions.length})
          </button>

          <button
            onClick={() => {
              setFilter("successful");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "successful"
                ? "bg-[#1FAE52] text-white shadow-sm"
                : "text-[#15121F]/70 hover:text-[#15121F]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Successful ({successfulCount})</span>
          </button>

          <button
            onClick={() => {
              setFilter("failed");
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "failed"
                ? "bg-red-600 text-white shadow-sm"
                : "text-[#15121F]/70 hover:text-[#15121F]"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed ({failedCount})</span>
          </button>
        </div>

        {/* Filter Summary */}
        <span className="text-xs font-bold text-[#15121F]/60">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} records
        </span>
      </div>

      {/* 3. Paginated Transactions Table */}
      <div className="overflow-x-auto border-2 border-[#15121F] rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-3 border-[#15121F] bg-[#F4F6F0] text-[#15121F] font-extrabold text-xs uppercase tracking-wider">
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Date & Time</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Campaign</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Recipient Wallet</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Amount</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Tx Hash</th>
              <th className="py-3 px-4 border-r-2 border-[#15121F]/15">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#15121F]/10 text-xs font-medium text-[#15121F]">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F4F6F0]/70 transition-colors">
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-bold whitespace-nowrap">
                    {tx.timestamp}
                  </td>

                  {/* Campaign */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-extrabold text-[#15121F]">
                    {tx.campaignName}
                  </td>

                  {/* Recipient Wallet (Anonymous Truncated) */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-mono font-bold whitespace-nowrap">
                    {tx.recipientAddress.slice(0, 8)}...{tx.recipientAddress.slice(-6)}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-extrabold font-mono text-[#1FAE52]">
                    {tx.amount}
                  </td>

                  {/* Tx Hash */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 font-mono">
                    <a
                      href={`https://www.oklink.com/xlayer-test/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#7C5CFA] font-extrabold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 border-r-2 border-[#15121F]/10 whitespace-nowrap">
                    {tx.status === "Successful" ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#1FAE52]/15 text-[#1FAE52] font-extrabold px-2.5 py-1 rounded-full border border-[#1FAE52]/30 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Successful</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 font-extrabold px-2.5 py-1 rounded-full border border-red-300 text-[11px]"
                        title={tx.failureReason || "Transaction Failed"}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Failed</span>
                      </span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.status === "Failed" ? (
                      <button
                        onClick={() => handleSingleRetry(tx.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#F6C61A] hover:bg-[#e2b412] text-[#15121F] font-extrabold text-xs border border-[#15121F] shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    ) : (
                      <a
                        href="/proof/cmp_xlayer1"
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-[#F4F6F0] hover:bg-[#15121F] text-[#15121F] hover:text-white font-extrabold text-xs border border-[#15121F]/20 cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Proof</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs font-bold text-[#15121F]/60">
                  No transactions match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Pagination Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <span className="text-xs font-extrabold text-[#15121F]/70">
          Page {currentPage} of {totalPages} ({filteredTransactions.length} Total Records)
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl bg-[#F4F6F0] hover:bg-gray-200 disabled:opacity-40 text-[#15121F] font-extrabold text-xs border-2 border-[#15121F]/20 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-extrabold border-2 cursor-pointer transition-colors ${
                  currentPage === idx + 1
                    ? "bg-[#15121F] text-white border-[#15121F]"
                    : "bg-[#F4F6F0] text-[#15121F] border-[#15121F]/20 hover:bg-gray-200"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl bg-[#F4F6F0] hover:bg-gray-200 disabled:opacity-40 text-[#15121F] font-extrabold text-xs border-2 border-[#15121F]/20 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

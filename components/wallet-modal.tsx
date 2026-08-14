"use client";

import React, { useState } from "react";
import { X, Wallet, ExternalLink, ShieldCheck, Link2, Zap, AlertCircle, Loader2 } from "lucide-react";
import { useConnect } from "wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connectAsync, isPending, error: wagmiError } = useConnect();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectorClick = async (connector: any) => {
    setErrorMessage(null);
    setPendingConnectorId(connector.id || connector.uid);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("grow_wallet_disconnected");
    }

    try {
      await connectAsync({ connector });
      onClose();
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      if (err?.message?.includes("rejected") || err?.message?.includes("User denied")) {
        setErrorMessage("Wallet connection request was declined.");
      } else if (err?.name === "ConnectorNotFoundError" || err?.message?.includes("not found")) {
        setErrorMessage("Wallet provider not detected in browser. Try selecting WalletConnect.");
      } else {
        setErrorMessage(err?.shortMessage || err?.message || "Failed to connect wallet.");
      }
    } finally {
      setPendingConnectorId(null);
    }
  };

  const getWalletDetails = (connector: any) => {
    const name = (connector.name || "").toLowerCase();
    if (name.includes("metamask")) {
      return {
        title: "MetaMask",
        desc: "Connect to your MetaMask browser extension or in-app browser",
        icon: <Wallet className="w-5 h-5 text-[#F7931A]" />,
        iconBg: "bg-[#F6C61A]/25",
        badge: "Popular",
        badgeBg: "bg-[#F6C61A] text-[#15121F]",
      };
    }
    if (name.includes("walletconnect")) {
      return {
        title: "WalletConnect",
        desc: "Scan QR code or connect OKX, Bitget, Trust Wallet, Rainbow & 300+ mobile apps",
        icon: <Link2 className="w-5 h-5 text-[#7C5CFA]" />,
        iconBg: "bg-[#7C5CFA]/20",
        badge: "Mobile & QR",
        badgeBg: "bg-[#7C5CFA] text-white",
      };
    }
    if (name.includes("coinbase")) {
      return {
        title: "Coinbase Wallet",
        desc: "Connect using Coinbase Wallet app or extension",
        icon: <ShieldCheck className="w-5 h-5 text-[#1FAE52]" />,
        iconBg: "bg-[#1FAE52]/20",
        badge: "",
        badgeBg: "",
      };
    }
    return {
      title: connector.name || "Browser / OKX Wallet",
      desc: "Connect using your installed browser extension or wallet provider",
      icon: <Zap className="w-5 h-5 text-[#B4E23F]" />,
      iconBg: "bg-[#15121F]",
      badge: "Injected",
      badgeBg: "bg-[#15121F] text-white",
    };
  };

  const displayConnectors = connectors.length > 0 ? connectors : [
    { id: "injected", name: "Browser / Injected Wallet", uid: "injected-fallback" },
    { id: "metaMask", name: "MetaMask", uid: "metamask-fallback" },
    { id: "walletConnect", name: "WalletConnect", uid: "wc-fallback" },
    { id: "coinbaseWallet", name: "Coinbase Wallet", uid: "coinbase-fallback" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#15121F]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] sm:rounded-[40px] border-4 border-[#15121F] shadow-[12px_12px_0px_0px_#15121F] max-w-md w-full overflow-hidden space-y-5 p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        
        {/* Header with High-Contrast Neo-Brutalist Icon & Close Button */}
        <div className="flex items-center justify-between border-b-3 border-[#15121F] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#15121F] text-[#B4E23F] border-3 border-[#15121F] flex items-center justify-center font-bold shadow-[3px_3px_0px_0px_#F6C61A] shrink-0">
              <Wallet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#15121F] tracking-tight">
                Connect Web3 Wallet
              </h3>
              <p className="text-xs font-bold text-[#15121F]/70">
                Select your installed mobile or browser wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-[#F4F6F0] hover:bg-[#1FAE52] hover:text-white text-[#15121F] flex items-center justify-center font-extrabold border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] transition-transform active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Error Alert Box */}
        {(errorMessage || wagmiError) && (
          <div className="p-3.5 bg-red-100 border-3 border-[#15121F] rounded-2xl text-xs font-extrabold text-red-700 flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#15121F] animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.5]" />
            <span>{errorMessage || wagmiError?.message}</span>
          </div>
        )}

        {/* Wallet Connector Options */}
        <div className="space-y-3.5">
          {displayConnectors.map((connector) => {
            const details = getWalletDetails(connector);
            const isConnectingThis = isPending && pendingConnectorId === (connector.id || connector.uid);

            return (
              <button
                key={connector.uid || connector.id}
                onClick={() => handleConnectorClick(connector)}
                disabled={isPending}
                className="w-full text-left p-4 rounded-2xl border-3 border-[#15121F] bg-white hover:bg-[#F4F6F0] shadow-[4px_4px_0px_0px_#15121F] hover:shadow-[6px_6px_0px_0px_#15121F] transition-all cursor-pointer flex items-center justify-between group active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#15121F] disabled:opacity-75"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl border-2 border-[#15121F] shadow-[2px_2px_0px_0px_#15121F] flex items-center justify-center shrink-0 ${details.iconBg}`}>
                    {isConnectingThis ? (
                      <Loader2 className="w-5 h-5 text-[#15121F] animate-spin" />
                    ) : (
                      details.icon
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm sm:text-base text-[#15121F] group-hover:text-[#1FAE52] transition-colors">
                        {details.title}
                      </span>
                      {details.badge && (
                        <span className={`px-2.5 py-0.5 rounded-full border border-[#15121F] text-[10px] font-extrabold shadow-xs ${details.badgeBg}`}>
                          {details.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#15121F]/70 line-clamp-1">
                      {isConnectingThis ? "Connecting wallet..." : details.desc}
                    </p>
                  </div>
                </div>
                {isConnectingThis ? (
                  <Loader2 className="w-4 h-4 text-[#15121F] animate-spin shrink-0" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-[#15121F] group-hover:translate-x-0.5 transition-transform shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Security Notice Banner in Emerald Green */}
        <div className="p-3.5 bg-[#1FAE52]/10 rounded-2xl border-3 border-[#15121F] shadow-[3px_3px_0px_0px_#15121F] text-xs font-bold text-[#15121F] flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#1FAE52] shrink-0 stroke-[2.5]" />
          <span>
            Connect securely on X Layer Testnet (Chain ID 1952). Never share your private keys.
          </span>
        </div>
      </div>
    </div>
  );
};

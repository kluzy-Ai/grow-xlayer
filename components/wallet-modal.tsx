"use client";

import React from "react";
import { X, Wallet, ExternalLink, ShieldCheck } from "lucide-react";
import { useConnect } from "wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connect } = useConnect();

  if (!isOpen) return null;

  const handleConnectorClick = (connector: any) => {
    // If standard browser without window.ethereum and user clicks MetaMask/OKX
    const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const hasInjected = typeof window !== "undefined" && Boolean((window as any).ethereum);

    if (isMobile && !hasInjected && connector.id === "metaMask") {
      const dappUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      onClose();
      return;
    }

    if (isMobile && !hasInjected && connector.id === "injected") {
      // Deep link for OKX / Injected mobile
      const dappUrl = encodeURIComponent(window.location.href);
      window.location.href = `okx://wallet/dapp/details?dappUrl=${dappUrl}`;
      setTimeout(() => {
        // Fallback to WalletConnect if deep-link doesn't launch
        const wc = connectors.find((c) => c.id === "walletConnect");
        if (wc) connect({ connector: wc });
      }, 1500);
      onClose();
      return;
    }

    connect({ connector });
    onClose();
  };

  const getWalletDetails = (connector: any) => {
    const name = connector.name.toLowerCase();
    if (name.includes("metamask")) {
      return {
        title: "MetaMask",
        desc: "Connect to your MetaMask mobile app or browser extension",
        icon: "🦊",
        badge: "Popular",
      };
    }
    if (name.includes("walletconnect")) {
      return {
        title: "WalletConnect",
        desc: "Scan QR or connect OKX, Trust Wallet, Rainbow & 300+ mobile apps",
        icon: "🔗",
        badge: "Mobile Best",
      };
    }
    if (name.includes("coinbase")) {
      return {
        title: "Coinbase Wallet",
        desc: "Connect using Coinbase Wallet mobile app or extension",
        icon: "🛡️",
        badge: "",
      };
    }
    return {
      title: connector.name || "Injected Wallet",
      desc: "Connect using your installed browser or mobile Web3 wallet",
      icon: "⚡",
      badge: "Injected",
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121F]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-4 border-[#15121F] shadow-2xl max-w-md w-full overflow-hidden space-y-5 p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#15121F]/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7C5CFA]/10 text-[#7C5CFA] border-2 border-[#15121F] flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-[#15121F]">
                Connect Web3 Wallet
              </h3>
              <p className="text-xs font-bold text-[#15121F]/60">
                Select your installed mobile or browser wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F4F6F0] hover:bg-gray-200 text-[#15121F] flex items-center justify-center font-bold transition-all border-2 border-[#15121F]/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallet Connector Options */}
        <div className="space-y-3">
          {connectors.map((connector) => {
            const details = getWalletDetails(connector);
            return (
              <button
                key={connector.uid || connector.id}
                onClick={() => handleConnectorClick(connector)}
                className="w-full text-left p-4 rounded-2xl border-2 border-[#15121F]/20 hover:border-[#15121F] bg-[#F4F6F0]/60 hover:bg-[#F4F6F0] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{details.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#15121F] group-hover:text-[#7C5CFA] transition-colors">
                        {details.title}
                      </span>
                      {details.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#15121F] text-white text-[9px] font-extrabold">
                          {details.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-[#15121F]/60 line-clamp-1">
                      {details.desc}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#15121F]/40 group-hover:text-[#15121F] transition-colors shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Security Footer */}
        <div className="p-3 bg-[#7C5CFA]/5 rounded-2xl border border-[#7C5CFA]/20 text-[11px] font-bold text-[#15121F]/70 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7C5CFA] shrink-0" />
          <span>
            Connect securely on X Layer Testnet (Chain ID 1952). Never share your private keys.
          </span>
        </div>
      </div>
    </div>
  );
};

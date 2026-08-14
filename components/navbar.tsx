"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, ArrowRight, Menu, X, LayoutDashboard, Wallet } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { WalletModal } from "./wallet-modal";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [isManuallyDisconnected, setIsManuallyDisconnected] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("grow_wallet_disconnected") === "true";
    }
    return false;
  });

  const isWalletActive = Boolean(isConnected && address && !isManuallyDisconnected);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Fixed Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 nav-backdrop border-b border-[#15121F]/10 shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-10 h-10 rounded-full bg-[#F6C61A] border-2 border-[#15121F] flex items-center justify-center font-display font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform text-[#15121F]">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-[#15121F]">
              Grow
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/#how-it-works"
              className="font-medium text-[#15121F] hover:text-[#1FAE52] transition-colors text-base"
            >
              How it works
            </Link>
            <Link
              href="/faq"
              className="font-medium text-[#15121F] hover:text-[#1FAE52] transition-colors text-base"
            >
              FAQ
            </Link>
            {!isDashboard ? (
              <Link
                href="/login"
                className="font-bold text-[#15121F] hover:text-[#7C5CFA] transition-colors text-base"
              >
                Creator Sign In
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="font-bold text-[#1FAE52] hover:text-[#7C5CFA] transition-colors text-base flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right CTA Row */}
          <div className="hidden lg:flex items-center gap-3">
            {isDashboard && (
              isWalletActive && address ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#15121F] hover:bg-[#2A2438] text-white text-xs font-extrabold border-2 border-[#15121F] flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  title="Manage Web3 Wallet"
                >
                  <Wallet className="w-4 h-4 text-[#B4E23F]" />
                  <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem("grow_wallet_disconnected");
                    }
                    setIsManuallyDisconnected(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-white hover:bg-[#F4F6F0] text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Wallet className="w-4 h-4 text-[#7C5CFA]" />
                  <span>Connect Wallet</span>
                </button>
              )
            )}

            <Link
              href="/dashboard"
              className="btn-pill btn-grow-primary px-5 py-2.5 text-sm flex items-center gap-1.5"
            >
              <span>{isDashboard ? "Creator App" : "Launch App"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Right Quick Action & Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {isDashboard && (
              isWalletActive && address ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#15121F] text-white text-xs font-extrabold border-2 border-[#15121F] flex items-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#B4E23F]" />
                  <span>{`${address.slice(0, 4)}...${address.slice(-2)}`}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem("grow_wallet_disconnected");
                    }
                    setIsManuallyDisconnected(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#15121F] text-xs font-extrabold border-2 border-[#15121F] flex items-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#7C5CFA]" />
                  <span>Wallet</span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/80 border border-[#15121F]/10 text-[#15121F] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col bg-[#B4E23F] pt-24 px-6 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-5 text-center text-xl font-display font-bold">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-2xl bg-white/60 text-[#15121F] border border-[#15121F]/10 active:scale-98"
            >
              How it works
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-2xl bg-white/60 text-[#15121F] border border-[#15121F]/10 active:scale-98"
            >
              FAQ
            </Link>
            {!isDashboard ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-2xl bg-white/60 text-[#15121F] border border-[#15121F]/10 active:scale-98"
              >
                Creator Sign In
              </Link>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 rounded-2xl bg-white/60 text-[#1FAE52] border border-[#15121F]/10 active:scale-98"
              >
                Dashboard
              </Link>
            )}

            {isDashboard && (
              !isWalletActive || !address ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem("grow_wallet_disconnected");
                    }
                    setIsManuallyDisconnected(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-white text-[#15121F] border-2 border-[#15121F] font-extrabold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Wallet className="w-5 h-5 text-[#7C5CFA]" />
                  <span>Connect Web3 Wallet</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-[#15121F] text-white border-2 border-[#15121F] font-extrabold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Wallet className="w-5 h-5 text-[#B4E23F]" />
                  <span>Connected: {`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                </button>
              )
            )}

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-pill btn-grow-primary py-4 text-lg mt-2 shadow-lg flex items-center justify-center gap-2"
            >
              <span>{isDashboard ? "Creator App" : "Launch App"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-auto text-center text-sm text-[#15121F]/70 font-medium">
            Grow © 2026
          </div>
        </div>
      )}

      {/* Global Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Coins, ArrowRight, Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link
              href="/login"
              className="font-bold text-[#15121F] hover:text-[#7C5CFA] transition-colors text-base"
            >
              Creator Sign In
            </Link>
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="btn-pill btn-grow-primary px-6 py-2.5 text-base flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-white/80 border border-[#15121F]/10 text-[#15121F] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col bg-[#B4E23F] pt-24 px-6 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6 text-center text-xl font-display font-bold">
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
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-2xl bg-white/60 text-[#15121F] border border-[#15121F]/10 active:scale-98"
            >
              Creator Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-pill btn-grow-primary py-4 text-lg mt-4 shadow-lg flex items-center justify-center gap-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-auto text-center text-sm text-[#15121F]/70 font-medium">
            Grow © 2026
          </div>
        </div>
      )}
    </>
  );
};

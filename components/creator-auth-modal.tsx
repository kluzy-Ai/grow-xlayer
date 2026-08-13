"use client";

import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, Building, Eye, EyeOff, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { signInCreator, signUpCreator } from "@/app/actions/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (creator: { email: string; communityName: string }) => void;
}

export const CreatorAuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (mode === "signup") {
      formData.append("communityName", communityName);
    }

    const res = mode === "signup" ? await signUpCreator(formData) : await signInCreator(formData);

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      const name = communityName || email.split("@")[0] + " Guild";
      onAuthenticated({ email, communityName: name });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15121F]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[36px] border-4 border-[#15121F] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#15121F]/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#F6C61A] border-2 border-[#15121F] flex items-center justify-center text-[#15121F]">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-[#15121F]">
                Creator Security Portal
              </h3>
              <p className="text-[11px] text-[#15121F]/60 font-medium">
                Safeguarding Community Treasuries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F6F0] text-[#15121F] font-bold border border-[#15121F]/20 hover:bg-[#15121F] hover:text-white transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F4F6F0] p-1.5 rounded-full border border-[#15121F]/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); }}
            className={`flex-1 py-2 rounded-full transition-colors ${
              mode === "signup" ? "bg-[#15121F] text-white" : "text-[#15121F]/70"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); }}
            className={`flex-1 py-2 rounded-full transition-colors ${
              mode === "signin" ? "bg-[#15121F] text-white" : "text-[#15121F]/70"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
                Community / Guild Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-[#15121F] focus:border-[#15121F] focus:outline-none"
                  placeholder="e.g. BuildX OKB Guild"
                />
                <Building className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
              Creator Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-medium text-[#15121F] focus:border-[#15121F] focus:outline-none"
                placeholder="creator@community.xyz"
              />
              <Mail className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-medium text-[#15121F] focus:border-[#15121F] focus:outline-none"
                placeholder="••••••••"
              />
              <Lock className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#15121F]/50 hover:text-[#15121F] p-1 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#B4E23F]/30 rounded-2xl border border-[#15121F]/10 text-xs text-[#15121F]/80 font-medium flex items-start gap-2">
            <Shield className="w-4 h-4 text-[#15121F] shrink-0 mt-0.5" />
            <span><strong>Security Note:</strong> Only verified creators need accounts to connect X Layer wallets & launch campaigns. Community claimers do not need an account.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-pill btn-grow-primary py-3.5 text-sm font-extrabold text-white shadow-lg mt-2 flex items-center justify-center"
          >
            {loading ? "Authenticating..." : mode === "signup" ? "Sign Up" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

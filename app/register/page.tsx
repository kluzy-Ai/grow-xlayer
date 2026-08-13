"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Building, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { signUpCreator } from "@/app/actions/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Mascot } from "@/components/mascot";

export default function RegisterPage() {
  const router = useRouter();
  const [communityName, setCommunityName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("communityName", communityName);
    formData.append("email", email);
    formData.append("password", password);

    const res = await signUpCreator(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#B4E23F]">
      <Navbar />

      {/* Auth Split Layout Container - Fully Responsive across Mobile, Tablet & Desktop */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-20 max-w-6xl mx-auto px-4 sm:px-6 my-auto w-full flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Mascot Illustration & Headline */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-6">
            <div className="animate-mascot-bob flex items-center justify-center">
              <Mascot pose="celebrate" size={160} className="sm:hidden" />
              <Mascot pose="celebrate" size={240} className="hidden sm:block lg:hidden" />
              <Mascot pose="celebrate" size={300} className="hidden lg:block" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#15121F] leading-tight">
                Start Token Drops on X Layer
              </h2>
              <p className="text-xs sm:text-base text-[#15121F]/80 font-medium max-w-md mx-auto leading-relaxed">
                Register a secured Creator Account for your community. Connect your Web3 treasury & drop tokens safely.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Form Screen */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-white rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] p-5 sm:p-8 lg:p-10 border-4 border-[#15121F] shadow-2xl space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3 border-b border-[#15121F]/10 pb-4">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <Mascot pose="arrow" size={40} />
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#15121F]">
                    Register Creator Account
                  </h1>
                  <p className="text-xs text-[#15121F]/60 font-medium mt-0.5">
                    Secured Community Portal
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1.5">
                    Community / Guild Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-bold text-sm text-[#15121F] focus:border-[#15121F] focus:outline-none"
                      placeholder="e.g. BuildX OKB Guild"
                    />
                    <Building className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1.5">
                    Creator Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-medium text-sm text-[#15121F] focus:border-[#15121F] focus:outline-none"
                      placeholder="creator@community.xyz"
                    />
                    <Mail className="w-5 h-5 text-[#15121F]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#15121F]/70 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3 rounded-2xl bg-[#F4F6F0] border-2 border-[#15121F]/20 font-medium text-sm text-[#15121F] focus:border-[#15121F] focus:outline-none"
                      placeholder="Your Password"
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
                  <span><strong>Creator Security Policy:</strong> Only community leaders who connect treasury wallets need an account. Community claimers require no account.</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-pill btn-grow-primary py-3.5 sm:py-4 text-base font-extrabold text-white shadow-xl flex items-center justify-center"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </form>

              <div className="pt-2 text-center text-xs font-semibold text-[#15121F]/70 border-t border-[#15121F]/10">
                Already have a Creator account?{" "}
                <Link href="/login" className="text-[#1FAE52] font-extrabold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer showCtaBanner={false} />
    </main>
  );
}

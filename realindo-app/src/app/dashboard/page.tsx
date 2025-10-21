"use client";

import { useWeb3Auth, useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserData } from "@/lib/hooks/useUserData";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { isConnected, status } = useWeb3Auth();
  const { disconnect } = useWeb3AuthDisconnect();
  const { address } = useAccount();
  const router = useRouter();
  const { userData, loading, error } = useUserData(address);
  const [copied, setCopied] = useState(false);

  // Protected route: redirect to login if not authenticated
  useEffect(() => {
    if (status === "not_ready") return; // Wait for Web3Auth to initialize
    
    if (!isConnected || status !== "connected") {
      router.push("/login");
    }
  }, [isConnected, status, router]);

  const handleLogout = async () => {
    try {
      await disconnect();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Loading state
  if (status === "not_ready" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">
            Error loading dashboard
          </p>
          <p className="text-sm text-gray-600 mt-2">{error.message}</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-purple-600">RealIndo</h1>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <span>🔗</span>
                <span>{address && truncateAddress(address)}</span>
                <button
                  onClick={copyAddress}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full">
                  <span className="text-lg">⭐</span>
                  <span className="font-bold text-purple-700">{userData?.current_exp || 0}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                  <span className="text-lg">🏆</span>
                  <span className="font-bold text-blue-700">{userData?.total_exp_earned || 0}</span>
                </div>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner - Learn in 3 Steps */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Learn Bahasa Banjar</h2>
              <p className="text-cyan-50 mb-6">in 3 steps</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm">Choose and watch a video lesson</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm">Practice the vocabulary you want</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="text-sm">Review it to keep it active in your mind</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-8xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Vocabulary Health */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">My Vocabulary Health</h3>
            <button className="text-cyan-600 hover:text-cyan-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">📘</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">0</span>
                    <span className="text-sm text-gray-500">new</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">📙</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">0</span>
                    <span className="text-sm text-gray-500">to review</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">📗</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">0</span>
                    <span className="text-sm text-gray-500">learned</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-500 mt-1">/505</div>
                    <div className="text-xs text-gray-400">Learned</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors">
            Start vocabulary review
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 text-left shadow-lg transition-all hover:scale-105">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold mb-2">Continue Learning</h3>
            <p className="text-purple-100 text-sm">Watch video lessons and earn EXP</p>
          </button>
          
          <button className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl p-6 text-left shadow-lg transition-all hover:scale-105">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold mb-2">Convert to RINDO</h3>
            <p className="text-orange-100 text-sm">Exchange EXP for tokens (1:1)</p>
          </button>
          
          <button className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl p-6 text-left shadow-lg transition-all hover:scale-105">
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="text-xl font-bold mb-2">Marketplace</h3>
            <p className="text-teal-100 text-sm">Redeem NFT vouchers</p>
          </button>
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Learning Progress</h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    B1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bahasa Banjar 01</h4>
                    <p className="text-sm text-gray-500">Sapaan & Makanan</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-purple-600 font-medium">📹 0/3 videos</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">+30 EXP available</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-400">0%</div>
                  <div className="w-24 h-2 bg-gray-100 rounded-full mt-2">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-2xl">
                    🎴
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Flashcards</h4>
                    <p className="text-sm text-gray-500">Vocabulary practice</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-orange-600 font-medium">📝 0/10 reviewed</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">+15 EXP per session</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-400">0%</div>
                  <div className="w-24 h-2 bg-gray-100 rounded-full mt-2">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

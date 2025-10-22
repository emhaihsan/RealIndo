"use client";

import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserData } from "@/lib/hooks/useUserData";
import { useRindoBalance } from "@/lib/hooks/useRindoBalance";
import { Button } from "@/components/ui/button";
import { TokenConversion } from "@/components/TokenConversion";
import { RindoBalanceDisplay } from "@/components/RindoBalanceDisplay";
import { ArrowLeft } from "lucide-react";

export default function ConvertPage() {
  const { isConnected, status } = useWeb3Auth();
  const { address } = useAccount();
  const router = useRouter();
  const { userData, loading, error, refetch } = useUserData(address);
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useRindoBalance(address);

  // Protected route: redirect to login if not authenticated
  useEffect(() => {
    if (status === "not_ready") return;

    if (!isConnected || status !== "connected") {
      router.push("/");
    }
  }, [isConnected, status, router]);

  // Loading state
  if (status === "not_ready" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
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
            Error loading data
          </p>
          <p className="text-sm text-gray-600 mt-2">{error.message}</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
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
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-900">
                Convert EXP to RINDO
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full">
                <span className="text-lg">⭐</span>
                <span className="font-bold text-purple-700">
                  {userData?.current_exp || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
            <span className="text-4xl">💰</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Convert Your EXP to RINDO Tokens
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exchange your earned EXP for RINDO tokens at a 1:1 ratio. RINDO tokens
            can be used to redeem NFT vouchers from local merchant partners.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Instant</h3>
            <p className="text-sm text-gray-600">
              Conversion happens immediately on-chain
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
            <p className="text-sm text-gray-600">
              Powered by Base blockchain
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl mb-2">🎁</div>
            <h3 className="font-semibold text-gray-900 mb-1">No Fees</h3>
            <p className="text-sm text-gray-600">
              Transaction fees paid by platform
            </p>
          </div>
        </div>

        {/* RINDO Balance Display */}
        {address && (
          <div className="max-w-2xl mx-auto mb-6">
            <RindoBalanceDisplay
              balance={balance}
              isLoading={balanceLoading}
              onRefresh={refetchBalance}
            />
          </div>
        )}

        {/* Conversion Component */}
        {address && (
          <div className="max-w-2xl mx-auto">
            <TokenConversion
              currentExp={userData?.current_exp || 0}
              walletAddress={address}
              onSuccess={() => {
                refetch();
                refetchBalance();
              }}
            />
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Enter Amount
                </h4>
                <p className="text-sm text-gray-600">
                  Choose how much EXP you want to convert. You can use the "Max"
                  button to convert all available EXP.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Confirm Conversion
                </h4>
                <p className="text-sm text-gray-600">
                  Click "Convert to RINDO" and wait for the blockchain transaction
                  to complete (usually takes 2-5 seconds).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Receive RINDO
                </h4>
                <p className="text-sm text-gray-600">
                  RINDO tokens are minted directly to your wallet. You can view the
                  transaction on BaseScan and use tokens in the marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/marketplace")}
            variant="outline"
            className="gap-2"
          >
            Visit Marketplace
            <span>🛒</span>
          </Button>
        </div>
      </main>
    </div>
  );
}

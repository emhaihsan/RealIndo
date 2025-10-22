"use client";

import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRindoBalance } from "@/lib/hooks/useRindoBalance";
import { useRedeemVoucher } from "@/lib/blockchain/redeemVoucher";
import { Button } from "@/components/ui/button";
import { VoucherCard } from "@/components/VoucherCard";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Voucher {
  id: number;
  name: string;
  discount: string;
  partner_name: string;
  location: string | null;
  terms: string | null;
  cost_in_rindo: number;
  nft_token_id: number;
  metadata_uri: string | null;
  is_active: boolean;
}

export default function MarketplacePage() {
  const { isConnected, status } = useWeb3Auth();
  const { address } = useAccount();
  const router = useRouter();
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useRindoBalance(address);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  
  // Wagmi hook for redeeming vouchers
  const { redeemVoucher } = useRedeemVoucher();

  // Protected route
  useEffect(() => {
    if (status === "not_ready") return;

    if (!isConnected || status !== "connected") {
      router.push("/login");
    }
  }, [isConnected, status, router]);

  // Fetch vouchers
  useEffect(() => {
    async function fetchVouchers() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("vouchers")
          .select("*")
          .eq("is_active", true)
          .order("cost_in_rindo", { ascending: true });

        if (fetchError) throw fetchError;

        setVouchers(data || []);
      } catch (err: any) {
        console.error("Error fetching vouchers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (isConnected) {
      fetchVouchers();
    }
  }, [isConnected]);

  const handleRedeem = async (voucher: Voucher) => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    if (!redeemVoucher) {
      toast.error("Redeem function not available. Please refresh the page.");
      console.error("redeemVoucher is undefined. Hook may not have initialized.");
      return;
    }

    setRedeemingId(voucher.id);

    try {
      // Show info toast
      toast.info("Please approve the transactions in your wallet...");

      // Call redeem function
      const result = await redeemVoucher(
        address as `0x${string}`,
        voucher.nft_token_id,
        1, // quantity
        voucher.cost_in_rindo
      );

      if (result.success && result.txHash) {
        // Log to database
        console.log("📝 Logging redemption to database...");
        const logPayload = {
          userId: address,
          voucherId: voucher.id,
          nftTokenId: voucher.nft_token_id,
          txHash: result.txHash,
        };
        console.log("📝 Log payload:", logPayload);

        const logResponse = await fetch("/api/voucher/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(logPayload),
        });

        console.log("📝 Log response status:", logResponse.status);
        console.log("📝 Log response ok:", logResponse.ok);

        const logData = await logResponse.json();
        console.log("📝 Log response data:", logData);

        if (logData.success) {
          console.log("✅ Database logging successful");
          toast.success(
            <div>
              <p className="font-semibold">NFT Redeemed Successfully! 🎉</p>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on BaseScan →
              </a>
            </div>,
            { duration: 10000 }
          );

          // Refresh balance
          refetchBalance();
        } else {
          console.error("❌ Database logging failed:", logData);
          toast.warning(
            `NFT minted but logging failed: ${logData.error || 'Unknown error'}`,
            { duration: 10000 }
          );
        }
      } else {
        toast.error(result.error || "Redemption failed");
      }
    } catch (error: any) {
      console.error("Redeem error:", error);
      toast.error(error.message || "Failed to redeem voucher");
    } finally {
      setRedeemingId(null);
    }
  };

  // Loading state
  if (status === "not_ready" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading marketplace...</p>
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
            Error loading marketplace
          </p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const userBalance = parseFloat(balance);

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
              <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                <span className="text-lg">💎</span>
                <span className="font-bold text-blue-700">
                  {balanceLoading ? "..." : parseFloat(balance).toFixed(2)} RINDO
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-100 rounded-full mb-4">
            <ShoppingBag className="w-10 h-10 text-cyan-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            NFT Voucher Marketplace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Redeem your RINDO tokens for exclusive NFT vouchers from local
            merchant partners in Kalimantan Selatan.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-2">🎁</div>
            <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
            <p className="text-sm text-gray-600">Available Vouchers</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-2">💎</div>
            <p className="text-2xl font-bold text-blue-600">
              {balanceLoading ? "..." : parseFloat(balance).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Your RINDO Balance</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-2">🏪</div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(vouchers.map((v) => v.partner_name)).size}
            </p>
            <p className="text-sm text-gray-600">Partner Merchants</p>
          </div>
        </div>

        {/* Vouchers Grid */}
        {vouchers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No vouchers available at the moment.</p>
            <Button
              onClick={() => router.push("/convert")}
              className="mt-4"
            >
              Get More RINDO
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                userBalance={userBalance}
                onRedeem={handleRedeem}
                isRedeeming={redeemingId === voucher.id}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need more RINDO tokens?</p>
          <Button
            onClick={() => router.push("/convert")}
            variant="outline"
            className="gap-2"
          >
            Convert EXP to RINDO
            <span>💰</span>
          </Button>
        </div>
      </main>
    </div>
  );
}

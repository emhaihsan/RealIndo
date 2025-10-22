"use client";

import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOwnedNfts } from "@/lib/hooks/useOwnedNfts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";

const VOUCHER_NFT_ADDRESS = process.env.NEXT_PUBLIC_VOUCHER_NFT_ADDRESS!;

export default function MyNFTsPage() {
  const { isConnected, status } = useWeb3Auth();
  const { address } = useAccount();
  const router = useRouter();
  const { ownedNfts, loading, error } = useOwnedNfts(address);

  // Protected route
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
          <p className="text-lg font-semibold">Loading your NFTs...</p>
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
            Error loading NFTs
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
              <h1 className="text-xl font-bold text-gray-900">My NFTs</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
            <Package className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            My Voucher NFTs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your redeemed vouchers are stored as NFTs on the Base blockchain.
            Each NFT represents a real voucher from our merchant partners.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-2">🎁</div>
            <p className="text-2xl font-bold text-gray-900">{ownedNfts.length}</p>
            <p className="text-sm text-gray-600">NFT Types Owned</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-3xl mb-2">🔢</div>
            <p className="text-2xl font-bold text-gray-900">
              {ownedNfts.reduce((sum, nft) => sum + nft.quantity, 0)}
            </p>
            <p className="text-sm text-gray-600">Total NFTs</p>
          </div>
        </div>

        {/* NFTs Grid */}
        {ownedNfts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No NFTs Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't redeemed any vouchers yet. Visit the marketplace to get started!
            </p>
            <Button
              onClick={() => router.push("/marketplace")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedNfts.map((nft) => (
              <Card key={nft.tokenId} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image/Icon */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-48 flex items-center justify-center">
                  <span className="text-6xl">🎁</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Quantity Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      {nft.discount}
                    </Badge>
                    <Badge variant="outline" className="font-bold">
                      Qty: {nft.quantity}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {nft.name}
                  </h3>

                  {/* Partner Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>🏪</span>
                    <span>{nft.partnerName}</span>
                  </div>

                  {/* Token ID */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Token ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      #{nft.tokenId}
                    </p>
                  </div>

                  {/* BaseScan Link */}
                  <a
                    href={`https://sepolia.basescan.org/token/${VOUCHER_NFT_ADDRESS}?a=${nft.tokenId}#inventory`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View on BaseScan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl p-8 border border-gray-200 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            About Your NFTs
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              ✅ <strong>Blockchain Verified:</strong> All your vouchers are stored as ERC-1155 NFTs on Base Sepolia
            </p>
            <p>
              🔒 <strong>You Own Them:</strong> These NFTs are in your wallet - you have full control
            </p>
            <p>
              📱 <strong>View Anytime:</strong> Click "View on BaseScan" to see your NFTs on the blockchain explorer
            </p>
            <p>
              🎁 <strong>Redeem in Person:</strong> Show your NFT to merchant partners to claim your discount
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

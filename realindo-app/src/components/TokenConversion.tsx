"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";

interface TokenConversionProps {
  currentExp: number;
  walletAddress: string;
  onSuccess?: () => void;
}

export function TokenConversion({
  currentExp,
  walletAddress,
  onSuccess,
}: TokenConversionProps) {
  const [expAmount, setExpAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [explorerUrl, setExplorerUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleConvert = async () => {
    // Reset states
    setError("");
    setTxHash("");
    setExplorerUrl("");

    // Validation
    const amount = Number(expAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount > currentExp) {
      setError(`Insufficient EXP. You only have ${currentExp} EXP available.`);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/exp/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: walletAddress,
          expAmount: amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTxHash(data.txHash);
        setExplorerUrl(data.explorerUrl);
        setExpAmount(""); // Reset input

        // Call success callback to refresh user data
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        setError(data.error || "Conversion failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Conversion error:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setExpAmount(currentExp.toString());
  };

  const truncateTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Convert EXP to RINDO</h3>
          <p className="text-sm text-gray-600">Exchange rate: 1 EXP = 1 RINDO</p>
        </div>
      </div>

      {/* Available EXP */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-1">Available EXP</p>
        <p className="text-2xl font-bold text-amber-700">{currentExp.toLocaleString()}</p>
      </div>

      {/* Input Field */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Amount to convert
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter amount"
            value={expAmount}
            onChange={(e) => setExpAmount(e.target.value)}
            disabled={isLoading}
            min="1"
            max={currentExp}
            className="flex-1"
          />
          <Button
            onClick={handleMaxClick}
            variant="outline"
            disabled={isLoading || currentExp === 0}
            className="px-4"
          >
            Max
          </Button>
        </div>
      </div>

      {/* Preview */}
      {expAmount && Number(expAmount) > 0 && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-amber-200">
          <p className="text-sm text-gray-600">You will receive</p>
          <p className="text-lg font-bold text-amber-700">
            {Number(expAmount).toLocaleString()} RINDO
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span>❌</span>
            {error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 mb-1">
                ✅ Conversion successful!
              </p>
              <p className="text-sm text-green-700 mb-2">
                {Number(expAmount || 0).toLocaleString()} RINDO tokens minted
              </p>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                View on BaseScan
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-green-600 mt-1 font-mono">
                {truncateTxHash(txHash)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Convert Button */}
      <Button
        onClick={handleConvert}
        disabled={isLoading || !expAmount || Number(expAmount) <= 0 || currentExp === 0}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            Convert to RINDO
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      {/* Info */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        Conversion is instant and irreversible. Transaction fee paid by platform.
      </p>
    </Card>
  );
}

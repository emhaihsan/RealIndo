import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

interface RindoBalanceDisplayProps {
  balance: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function RindoBalanceDisplay({
  balance,
  isLoading,
  onRefresh,
}: RindoBalanceDisplayProps) {
  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num === 0) return "0";
    if (num < 0.01) return num.toFixed(6);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const tokenAddress = process.env.NEXT_PUBLIC_RINDO_TOKEN_ADDRESS;
  const baseScanUrl = tokenAddress
    ? `https://sepolia.basescan.org/token/${tokenAddress}`
    : null;

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💎</span>
            <p className="text-sm font-medium text-blue-700">RINDO Balance</p>
          </div>
          <p className="text-4xl font-bold text-blue-900 mb-1">
            {formatBalance(balance)}
          </p>
          <p className="text-xs text-blue-600">ERC20 Token on Base Sepolia</p>
        </div>
        <div className="flex flex-col gap-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="icon-sm"
              className="text-blue-600 hover:text-blue-700"
              title="Refresh balance"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {baseScanUrl && (
            <a
              href={baseScanUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View on BaseScan"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

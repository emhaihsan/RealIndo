import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface VoucherCardProps {
  voucher: Voucher;
  userBalance: number;
  onRedeem: (voucher: Voucher) => void;
  isRedeeming?: boolean;
}

export function VoucherCard({
  voucher,
  userBalance,
  onRedeem,
  isRedeeming,
}: VoucherCardProps) {
  const canAfford = userBalance >= voucher.cost_in_rindo;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image/Icon */}
      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 h-48 flex items-center justify-center">
        <span className="text-6xl">🎁</span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Badge */}
        <Badge className="mb-3 bg-green-100 text-green-800 hover:bg-green-100">
          {voucher.discount}
        </Badge>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {voucher.name}
        </h3>

        {/* Partner Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span>🏪</span>
          <span>{voucher.partner_name}</span>
        </div>

        {/* Location */}
        {voucher.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>📍</span>
            <span>{voucher.location}</span>
          </div>
        )}

        {/* Terms */}
        {voucher.terms && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Terms:</span> {voucher.terms}
            </p>
          </div>
        )}

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-2xl font-bold text-blue-600">
              {voucher.cost_in_rindo} RINDO
            </p>
          </div>
          <Button
            onClick={() => onRedeem(voucher)}
            disabled={!canAfford || isRedeeming || !voucher.is_active}
            className={
              canAfford && voucher.is_active
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }
          >
            {isRedeeming
              ? "Redeeming..."
              : !canAfford
              ? "Insufficient RINDO"
              : "Redeem NFT"}
          </Button>
        </div>

        {/* Insufficient Balance Warning */}
        {!canAfford && voucher.is_active && (
          <p className="text-xs text-red-600 mt-2">
            You need {voucher.cost_in_rindo - userBalance} more RINDO
          </p>
        )}
      </div>
    </Card>
  );
}

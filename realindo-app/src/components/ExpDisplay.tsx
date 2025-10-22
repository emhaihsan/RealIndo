import { Card } from "@/components/ui/card";
import { Coins, TrendingUp } from "lucide-react";

interface ExpDisplayProps {
  currentExp: number;
  totalExp: number;
  isLoading?: boolean;
}

export function ExpDisplay({ currentExp, totalExp, isLoading }: ExpDisplayProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </Card>
        <Card className="p-6 animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Available EXP (Call to Action) */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-700">Available EXP</p>
            </div>
            <p className="text-4xl font-bold text-green-900 mb-1">
              {currentExp.toLocaleString()}
            </p>
            <p className="text-xs text-green-600">
              {currentExp > 0 ? "Ready to convert to RINDO" : "Earn more EXP!"}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </Card>

      {/* Total EXP Earned (Secondary Info) */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-medium text-purple-700">Total Earned</p>
            </div>
            <p className="text-4xl font-bold text-purple-900 mb-1">
              {totalExp.toLocaleString()}
            </p>
            <p className="text-xs text-purple-600">Lifetime achievement</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⭐</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

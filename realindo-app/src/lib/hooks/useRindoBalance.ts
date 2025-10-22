import { useEffect, useState } from "react";
import { ethers } from "ethers";

const RINDO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RINDO_TOKEN_ADDRESS!;
const BASE_SEPOLIA_RPC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!;

// Minimal ABI - only balanceOf function
const RINDO_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
];

export function useRindoBalance(walletAddress: string | undefined) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = async () => {
    if (!walletAddress || !RINDO_TOKEN_ADDRESS || !BASE_SEPOLIA_RPC) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Setup provider and contract
      const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
      const contract = new ethers.Contract(
        RINDO_TOKEN_ADDRESS,
        RINDO_TOKEN_ABI,
        provider
      );

      // Query balance (returns BigInt in wei)
      const balanceWei = await contract.balanceOf(walletAddress);

      // Convert from wei (18 decimals) to RINDO tokens
      const balanceFormatted = ethers.formatUnits(balanceWei, 18);

      setBalance(balanceFormatted);
    } catch (err) {
      console.error("Error fetching RINDO balance:", err);
      setError(err as Error);
      setBalance("0");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [walletAddress]);

  return { balance, loading, error, refetch: fetchBalance };
}

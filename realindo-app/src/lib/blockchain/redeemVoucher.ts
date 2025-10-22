"use client";

import { parseUnits } from "viem";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { useConfig } from "wagmi";
import { RindoTokenABI } from "@/lib/abis/RindoToken";
import { VoucherNFTABI } from "@/lib/abis/VoucherNFT";

const RINDO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RINDO_TOKEN_ADDRESS! as `0x${string}`;
const VOUCHER_NFT_ADDRESS = process.env.NEXT_PUBLIC_VOUCHER_NFT_ADDRESS! as `0x${string}`;

export interface RedeemResult {
  success: boolean;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Hook to get redeemVoucher function with Web3Auth's Wagmi config
 * Must be called from a component inside WagmiProvider
 */
export function useRedeemVoucher() {
  const config = useConfig();

  const redeemVoucher = async (
    userAddress: `0x${string}`,
    tokenId: number,
    quantity: number,
    costInRindo: number
  ): Promise<RedeemResult> => {
  try {
      const totalCostWei = parseUnits((costInRindo * quantity).toString(), 18);

      console.log("🎫 Starting redeem:", { tokenId, quantity, costInRindo });
      console.log("🔧 Using Wagmi config:", config);

      // Step 1: Check allowance
      console.log("📊 Step 1: Checking allowance...");
      const currentAllowance = (await readContract(config, {
        address: RINDO_TOKEN_ADDRESS,
        abi: RindoTokenABI,
        functionName: "allowance",
        args: [userAddress, VOUCHER_NFT_ADDRESS],
      })) as bigint;
      console.log("💰 Current allowance:", currentAllowance.toString(), "Required:", totalCostWei.toString());

      // Step 2: Approve if needed
      if (currentAllowance < totalCostWei) {
        console.log("🔑 Step 2: Approving RINDO...");
        const approveTx = await writeContract(config, {
          address: RINDO_TOKEN_ADDRESS,
          abi: RindoTokenABI,
          functionName: "approve",
          args: [VOUCHER_NFT_ADDRESS, totalCostWei],
        });
        console.log("⏳ Waiting for approval tx:", approveTx);
        await waitForTransactionReceipt(config, { hash: approveTx });
        console.log("✅ Approved!");
      } else {
        console.log("✅ Allowance sufficient, skipping approve");
      }

      // Step 3: Redeem voucher (mint NFT)
      console.log("🎁 Step 3: Minting NFT...");
      const redeemTx = await writeContract(config, {
        address: VOUCHER_NFT_ADDRESS,
        abi: VoucherNFTABI,
        functionName: "redeemVoucher",
        args: [BigInt(tokenId), BigInt(quantity)],
      });
      console.log("⏳ Waiting for redeem tx:", redeemTx);
      await waitForTransactionReceipt(config, { hash: redeemTx });
      console.log("✅ NFT Minted!", redeemTx);

      return {
        success: true,
        txHash: redeemTx,
        explorerUrl: `https://sepolia.basescan.org/tx/${redeemTx}`,
      };
    } catch (error: any) {
      console.error("❌ Redeem error:", error);
    
      let errorMessage = "Redemption failed";
      if (error.message?.includes("User rejected")) {
        errorMessage = "Transaction rejected";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH for gas";
      } else if (error.message?.includes("Voucher does not exist")) {
        errorMessage = "Voucher not added to contract yet";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  return { redeemVoucher };
}

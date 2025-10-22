"use client";

import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { VoucherNFTABI } from "@/lib/abis/VoucherNFT";
import { createClient } from "@supabase/supabase-js";

const VOUCHER_NFT_ADDRESS = process.env.NEXT_PUBLIC_VOUCHER_NFT_ADDRESS! as `0x${string}`;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface OwnedNFT {
  tokenId: number;
  quantity: number;
  name: string;
  discount: string;
  partnerName: string;
  metadataUri: string | null;
  costInRindo: number;
}

export function useOwnedNfts(userAddress: string | undefined) {
  const [ownedNfts, setOwnedNfts] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOwnedNfts() {
      if (!userAddress) {
        setOwnedNfts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all active vouchers from database
        const { data: vouchers, error: vouchersError } = await supabase
          .from("vouchers")
          .select("*")
          .eq("is_active", true);

        if (vouchersError) throw vouchersError;

        if (!vouchers || vouchers.length === 0) {
          setOwnedNfts([]);
          setLoading(false);
          return;
        }

        // Query balance for each voucher NFT
        const ownedNftsPromises = vouchers.map(async (voucher) => {
          try {
            const balance = await readContract(config, {
              address: VOUCHER_NFT_ADDRESS,
              abi: VoucherNFTABI,
              functionName: "balanceOf",
              args: [userAddress as `0x${string}`, BigInt(voucher.nft_token_id)],
            }) as bigint;

            const quantity = Number(balance);

            // Only return if user owns this NFT
            if (quantity > 0) {
              return {
                tokenId: voucher.nft_token_id,
                quantity,
                name: voucher.name,
                discount: voucher.discount,
                partnerName: voucher.partner_name,
                metadataUri: voucher.metadata_uri,
                costInRindo: voucher.cost_in_rindo,
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching balance for token ${voucher.nft_token_id}:`, err);
            return null;
          }
        });

        const results = await Promise.all(ownedNftsPromises);
        const owned = results.filter((nft): nft is OwnedNFT => nft !== null);

        setOwnedNfts(owned);
      } catch (err: any) {
        console.error("Error fetching owned NFTs:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOwnedNfts();
  }, [userAddress]);

  return { ownedNfts, loading, error, refetch: () => {} };
}

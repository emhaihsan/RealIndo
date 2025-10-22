import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema
const redeemSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  voucherId: z.number().int().positive("Invalid voucher ID"),
  nftTokenId: z.number().int().positive("Invalid NFT token ID"),
  txHash: z.string().min(1, "Transaction hash required"),
});

export async function POST(request: NextRequest) {
  console.log("[API] /api/voucher/redeem - START");
  try {
    const body = await request.json();
    console.log("[API] Request body:", JSON.stringify(body, null, 2));

    // Validate input
    const validation = redeemSchema.safeParse(body);
    if (!validation.success) {
      console.error("[API] Validation failed:", validation.error);
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, voucherId, nftTokenId, txHash } = validation.data;
    console.log("[API] Validated data:", { userId, voucherId, nftTokenId, txHash });

    // Get user by wallet address (case-insensitive)
    const normalizedUserId = userId.toLowerCase();
    console.log("[API] Looking up user by wallet:", userId, "normalized:", normalizedUserId);
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", normalizedUserId)
      .single();

    if (userError) {
      console.error("[API] User lookup error:", userError);
      return NextResponse.json(
        { success: false, error: "User not found", details: userError.message },
        { status: 404 }
      );
    }

    if (!user) {
      console.error("[API] User not found in database:", userId);
      return NextResponse.json(
        { success: false, error: "User not found in database. Please complete onboarding." },
        { status: 404 }
      );
    }

    console.log("[API] User found:", user.id);

    // Log redemption in voucher_redeems table
    console.log("[API] Inserting redemption record:", {
      user_id: user.id,
      voucher_id: voucherId,
      nft_token_id: nftTokenId,
      tx_hash: txHash,
      status: "confirmed",
    });

    const { data: redeem, error: redeemError } = await supabase
      .from("voucher_redeems")
      .insert({
        user_id: user.id,
        voucher_id: voucherId,
        nft_token_id: nftTokenId,
        tx_hash: txHash,
        status: "confirmed",
      })
      .select()
      .single();

    if (redeemError) {
      console.error("[API] Error logging redemption:", redeemError);
      console.error("[API] Error code:", redeemError.code);
      console.error("[API] Error message:", redeemError.message);
      console.error("[API] Error details:", redeemError.details);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to log redemption",
          details: redeemError.message,
          code: redeemError.code
        },
        { status: 500 }
      );
    }

    console.log("[API] Redemption logged successfully:", redeem);

    console.log("[API] /api/voucher/redeem - SUCCESS");
    return NextResponse.json({
      success: true,
      redeem,
      message: "Voucher redeemed successfully",
    });
  } catch (error: any) {
    console.error("[API] Unhandled error:", error);
    console.error("[API] Error stack:", error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

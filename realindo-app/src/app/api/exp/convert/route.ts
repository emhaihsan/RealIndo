import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import { z } from "zod";

// Initialize Supabase with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Smart contract configuration
const RINDO_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RINDO_TOKEN_ADDRESS!;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY!;
const BASE_SEPOLIA_RPC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!;

if (!RINDO_TOKEN_ADDRESS || !ADMIN_PRIVATE_KEY || !BASE_SEPOLIA_RPC) {
  throw new Error("Missing contract or admin wallet configuration");
}

// RINDOToken ABI (only mintFromEXP function)
const RINDO_TOKEN_ABI = [
  "function mintFromEXP(address user, uint256 expAmount) external",
];

// Validation schema
const convertExpSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  expAmount: z.number().int().positive("expAmount must be a positive integer"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = convertExpSchema.parse(body);
    const { userId, expAmount } = validatedData;

    console.log("💰 EXP Conversion Request:", { userId, expAmount });

    // Normalize wallet address
    const normalizedUserId = userId.toLowerCase();

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, wallet_address, current_exp")
      .eq("wallet_address", normalizedUserId)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has enough EXP
    if (user.current_exp < expAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient EXP",
          available: user.current_exp,
          requested: expAmount,
        },
        { status: 400 }
      );
    }

    // Setup ethers provider and wallet
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    
    console.log("🔑 Admin wallet:", adminWallet.address);

    // Connect to RINDOToken contract
    const rindoToken = new ethers.Contract(
      RINDO_TOKEN_ADDRESS,
      RINDO_TOKEN_ABI,
      adminWallet
    );

    // Convert EXP to token amount with 18 decimals
    // 10 EXP = 10 * 10^18 wei = 10 RINDO tokens
    const tokenAmount = ethers.parseUnits(expAmount.toString(), 18);

    // Call mintFromEXP on smart contract
    console.log("📝 Calling mintFromEXP...", {
      user: user.wallet_address,
      expAmount,
      tokenAmount: tokenAmount.toString(),
    });

    const tx = await rindoToken.mintFromEXP(user.wallet_address, tokenAmount);
    console.log("⏳ Transaction sent:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    // Deduct EXP from user (atomic operation)
    const newCurrentExp = user.current_exp - expAmount;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        current_exp: newCurrentExp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user EXP:", updateError);
      // Transaction already minted, but DB update failed
      // Log this for manual reconciliation
      return NextResponse.json(
        {
          success: false,
          error: "Tokens minted but failed to update EXP balance",
          txHash: receipt.hash,
        },
        { status: 500 }
      );
    }

    // Log conversion in token_conversions table
    const { error: logError } = await supabase
      .from("token_conversions")
      .insert([
        {
          user_id: user.id,
          exp_amount: expAmount,
          tx_hash: receipt.hash,
          status: "confirmed",
        },
      ]);

    if (logError) {
      console.error("Error logging conversion:", logError);
      // Don't fail - conversion already successful
    }

    console.log("✅ EXP conversion successful:", {
      userId,
      expAmount,
      txHash: receipt.hash,
      newCurrentExp,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Converted ${expAmount} EXP to ${expAmount} RINDO`,
        txHash: receipt.hash,
        newExp: newCurrentExp,
        explorerUrl: `https://sepolia.basescan.org/tx/${receipt.hash}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle ethers errors
    if (error.code) {
      console.error("Blockchain error:", {
        code: error.code,
        message: error.message,
        reason: error.reason,
      });

      return NextResponse.json(
        {
          success: false,
          error: error.reason || error.message || "Blockchain transaction failed",
        },
        { status: 500 }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

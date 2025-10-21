import { createClient } from "@supabase/supabase-js";

// Create Supabase client for client-side operations
// Uses anon key with RLS policies
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create or update user in Supabase database
 * Uses upsert to handle both new and returning users
 * @param walletAddress - Ethereum wallet address
 * @param email - User email from Web3Auth
 * @param name - User name from Web3Auth (optional)
 * @returns User record from database
 */
export async function createOrUpdateUser(
  walletAddress: string,
  email?: string,
  name?: string
) {
  try {
    console.log("💾 Attempting to upsert user to database...");
    console.log("📝 Data:", {
      wallet_address: walletAddress.toLowerCase(),
      email: email || null,
      name: name || null,
    });

    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(), // Normalize to lowercase
          email: email || null,
          name: name || null, // Now column exists in DB
          current_exp: 0, // Default for new users
          total_exp_earned: 0, // Default for new users
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address", // Update if wallet_address exists
          ignoreDuplicates: false, // Always update
        }
      )
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error,
      });
      throw error;
    }

    console.log("✅ User synced to database:", user);
    return user;
  } catch (error: any) {
    console.error("❌ Error creating/updating user:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      fullError: error,
    });
    throw new Error(
      `Failed to sync user to database: ${error?.message || "Unknown error"}`
    );
  }
}

/**
 * Main helper: Sync wallet address and user info to database
 * Call this after successful Web3Auth login
 * @param walletAddress - Wallet address from Wagmi useAccount hook
 * @param userInfo - User info from Web3Auth (email, name, etc.)
 * @returns User record with wallet address
 */
export async function syncUserToDatabase(
  walletAddress: string,
  userInfo: any
) {
  try {
    console.log("🚀 Starting syncUserToDatabase...");
    console.log("📍 Wallet address:", walletAddress);
    console.log("👤 User info:", userInfo);

    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }

    // Create or update user in Supabase
    const user = await createOrUpdateUser(
      walletAddress,
      userInfo?.email,
      userInfo?.name
    );

    console.log("✅ syncUserToDatabase completed successfully");
    return {
      ...user,
      wallet_address: walletAddress,
    };
  } catch (error: any) {
    console.error("❌ Error in syncUserToDatabase:", {
      message: error?.message,
      stack: error?.stack,
      fullError: error,
    });
    throw error;
  }
}
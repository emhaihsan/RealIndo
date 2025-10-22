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
    console.log("💾 Attempting to create/update user in database...");
    console.log("📝 Data:", {
      wallet_address: walletAddress.toLowerCase(),
      email: email || null,
      name: name || null,
    });

    const normalizedAddress = walletAddress.toLowerCase();

    // Step 1: Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = not found (expected for new users)
      console.error("❌ Error checking user:", checkError);
      throw checkError;
    }

    if (existingUser) {
      // User exists - only update email/name, PRESERVE EXP
      console.log("✅ User exists, updating profile only (preserving EXP)");
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          email: email || existingUser.email,
          name: name || existingUser.name,
          updated_at: new Date().toISOString(),
        })
        .eq("wallet_address", normalizedAddress)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating user:", updateError);
        throw updateError;
      }

      console.log("✅ User profile updated:", updatedUser);
      return updatedUser;
    } else {
      // New user - create with EXP = 0
      console.log("🆕 New user, creating with EXP = 0");
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          wallet_address: normalizedAddress,
          email: email || null,
          name: name || null,
          current_exp: 0,
          total_exp_earned: 0,
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating user:", insertError);
        throw insertError;
      }

      console.log("✅ New user created:", newUser);
      return newUser;
    }
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
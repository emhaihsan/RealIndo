/**
 * Test file to verify environment variable validation
 * Run this to check if env vars are properly configured
 * 
 * Usage: Import this file in any component to trigger validation
 */

import { env } from "./env";

console.log("✅ Environment variables validated successfully!");
console.log("\n📋 Current configuration:");
console.log("- Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL);
console.log("- Web3Auth Client ID:", env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ? "✓ Set" : "✗ Not set");
console.log("- Base Sepolia RPC:", env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL);
console.log("- Chain ID:", env.NEXT_PUBLIC_CHAIN_ID);
console.log("- RINDO Token Address:", env.NEXT_PUBLIC_RINDO_TOKEN_ADDRESS || "⚠️  Not deployed yet");
console.log("- Voucher NFT Address:", env.NEXT_PUBLIC_VOUCHER_NFT_ADDRESS || "⚠️  Not deployed yet");
console.log("- Admin Wallet:", env.ADMIN_WALLET_PRIVATE_KEY ? "✓ Configured" : "⚠️  Not set yet");

export { env };

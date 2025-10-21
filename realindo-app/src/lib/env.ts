import { z } from "zod";

/**
 * Environment Variables Schema with Zod Validation
 * This ensures all required env vars are present and properly typed
 */
const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required",
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: "SUPABASE_SERVICE_ROLE_KEY is required for backend operations",
  }),

  // Web3Auth Configuration
  NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: z.string().min(1, {
    message: "NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required",
  }),

  // Base Sepolia Network Configuration
  NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: z.string().url({
    message: "NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL must be a valid URL",
  }),
  NEXT_PUBLIC_CHAIN_ID: z.string().default("84532"), // Base Sepolia chain ID

  // Smart Contract Addresses (optional until deployed)
  NEXT_PUBLIC_RINDO_TOKEN_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_VOUCHER_NFT_ADDRESS: z.string().optional(),

  // Admin Wallet (optional until needed for token minting)
  ADMIN_WALLET_PRIVATE_KEY: z.string().optional(),
});

/**
 * Validate and parse environment variables
 * Throws descriptive error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => {
        return `❌ ${issue.path.join(".")}: ${issue.message}`;
      });

      console.error("❌ Environment variable validation failed:\n");
      console.error(missingVars.join("\n"));
      console.error("\n💡 Check your .env.local file and compare with .env.example\n");

      throw new Error("Invalid environment variables");
    }
    throw error;
  }
}

/**
 * Validated environment variables with TypeScript autocomplete
 * Import this in any file that needs env vars
 */
export const env = validateEnv();

/**
 * Type-safe environment variables
 * TypeScript will autocomplete all available env vars
 */
export type Env = z.infer<typeof envSchema>;

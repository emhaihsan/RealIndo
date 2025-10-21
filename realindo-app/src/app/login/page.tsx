"use client";

import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { syncUserToDatabase } from "@/lib/auth-helpers";
import { useAccount } from "wagmi";

export default function LoginPage() {
  const { isConnected, status } = useWeb3Auth();
  const { connect } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount(); // Wagmi hook - gives address directly!
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already connected
  useEffect(() => {
    if (isConnected && status === "connected") {
      router.push("/dashboard");
    }
  }, [isConnected, status, router]);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);

      // 1. Connect with Web3Auth
      await connect();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
      setIsLoggingIn(false);
    }
  };

  // Effect: Sync user to database after address is available
  useEffect(() => {
    async function syncUser() {
      // Only require isConnected, address, and isLoggingIn
      // userInfo is optional (wallet-only login won't have it)
      if (isConnected && address && isLoggingIn) {
        try {
          console.log("🔄 Syncing user to database...");
          console.log("📊 State check:", {
            isConnected,
            address,
            hasUserInfo: !!userInfo,
            userInfo,
            isLoggingIn,
          });
          
          // Pass userInfo even if undefined - auth-helpers will handle it
          const user = await syncUserToDatabase(address, userInfo || {});
          console.log("✅ User synced:", user);

          // Show success message - adapt based on login type
          const loginType = userInfo?.email ? "Social" : "Wallet";
          const message = userInfo?.email 
            ? `✅ Login successful!\n\nWallet: ${address}\nEmail: ${userInfo.email}`
            : `✅ Login successful!\n\nWallet: ${address}\nLogin type: Wallet-only`;
          
          alert(message);
          router.push("/dashboard");
        } catch (error: any) {
          console.error("❌ Failed to sync user - FULL ERROR:", {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
            fullError: error,
          });
          
          // Suppress error alert for hot reload/network issues
          const isHotReloadError = error?.message?.includes("Failed to fetch");
          const isPopupClosedError = error?.message?.includes("popup has been closed");
          
          if (!isHotReloadError && !isPopupClosedError) {
            alert(
              `Login successful but failed to sync user data.\n\nError: ${error?.message || "Unknown error"}\n\nCheck console for details.`
            );
          } else {
            console.log("⚠️ Suppressed error (likely hot reload or cancelled popup):", error?.message);
          }
        } finally {
          setIsLoggingIn(false);
        }
      }
    }

    syncUser();
  }, [isConnected, address, userInfo, isLoggingIn, router]);

  if (status === "connecting" || status === "not_ready" || isLoggingIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">
            {isLoggingIn ? "Setting up your account..." : "Loading..."}
          </p>
          {isLoggingIn && (
            <p className="text-sm text-gray-500 mt-2">
              Creating wallet and syncing data
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to RealIndo
          </h1>
          <p className="mt-2 text-gray-600">
            Learn regional languages, earn rewards
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-white font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? "Connecting..." : "Sign in with Web3Auth"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Connect your wallet to get started
          </p>
        </div>
      </div>
    </div>
  );
}

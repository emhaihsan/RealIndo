"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { syncUserToDatabase } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { isConnected, status } = useWeb3Auth();
  const { connect } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already connected
  useEffect(() => {
    if (isConnected && status === "connected") {
      router.push("/dashboard");
    }
  }, [isConnected, status, router]);

  // Handle login
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await connect();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
      setIsLoggingIn(false);
    }
  };

  // Sync user to database after login
  useEffect(() => {
    async function syncUser() {
      if (isConnected && address && isLoggingIn) {
        try {
          console.log("🔄 Syncing user to database...");
          const user = await syncUserToDatabase(address, userInfo || {});
          console.log("✅ User synced:", user);
          
          router.push("/dashboard");
        } catch (error: any) {
          console.error("❌ Failed to sync user:", error);
          
          const isHotReloadError = error?.message?.includes("Failed to fetch");
          const isPopupClosedError = error?.message?.includes("popup has been closed");
          
          if (!isHotReloadError && !isPopupClosedError) {
            alert(`Login successful but failed to sync user data.\n\nError: ${error?.message || "Unknown error"}`);
          }
        } finally {
          setIsLoggingIn(false);
        }
      }
    }
    syncUser();
  }, [isConnected, address, userInfo, isLoggingIn, router]);

  // Show loading state during login
  if (status === "connecting" || status === "not_ready" || isLoggingIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🎓</div>
          <p className="text-lg font-semibold text-gray-900">
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              RINDO
            </h1>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-orange-600 transition text-sm"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-orange-600 transition text-sm"
              >
                Features
              </a>
              <a
                href="#how"
                className="text-gray-700 hover:text-orange-600 transition text-sm"
              >
                How It Works
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-orange-600 transition text-sm"
              >
                Contact
              </a>
            </div>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="bg-black hover:bg-gray-900 text-white px-6 py-2 text-sm disabled:bg-gray-400"
            >
              {isLoggingIn ? "Connecting..." : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-6xl md:text-7xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Learn Regional
              <br />
              <span className="text-orange-600">Languages</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              It's simple, the best way to learn or practice a language is
              through fun! Master Bahasa Banjar and other regional Indonesian
              languages with interactive videos, flashcards, and real rewards.
            </p>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="bg-black hover:bg-gray-900 text-white px-8 py-3 text-base disabled:bg-gray-400"
            >
              {isLoggingIn ? "Connecting..." : "Start Learning →"}
            </Button>
          </div>
          <div className="relative h-96 flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-orange-100 rounded-full opacity-20"></div>
            <div className="relative z-10 text-6xl">🎓</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 bg-gray-50"
      >
        <div className="mb-20">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8">
            We love teaching
            <br />
            languages to learners!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Our platform combines interactive learning with real economic
            rewards, making language education engaging and valuable.
          </p>
        </div>

        {/* Feature Cards with Images */}
        <div className="space-y-20">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="w-full h-80 bg-linear-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center text-6xl transform -rotate-3">
                📹
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Interactive Videos
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Learn from native speakers with high-quality video lessons. Each
                video comes with bilingual transcripts (Indonesian ↔ Bahasa
                Banjar) to help you understand every word.
              </p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold">
                <span>+10 EXP per video</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Smart Flashcards
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Practice with intelligent flashcards that use space repetition
                algorithm. The system learns your pace and shows you cards at
                the right time for optimal retention.
              </p>
              <div className="flex items-center gap-2 text-orange-600 font-semibold">
                <span>+15 EXP per session</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-linear-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center text-6xl transform rotate-3">
                🎴
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="w-full h-80 bg-linear-to-br from-green-100 to-green-50 rounded-3xl flex items-center justify-center text-6xl transform -rotate-2">
                �
              </div>
            </div>
            <div>
              <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Real Rewards
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Convert your EXP into RINDO tokens and redeem them for real
                vouchers from local merchants. Your learning has actual economic
                value!
              </p>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span>NFT vouchers on Base blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how"
        className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24"
      >
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-16">
          The Best Way To Learn
          <br />A Language Is To Connect!
        </h2>

        <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our platform combines proven language learning methods with
              blockchain technology. Learn at your own pace, earn rewards, and
              connect with a community of language enthusiasts.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎬</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Watch Videos</h4>
                  <p className="text-gray-600 text-sm">
                    Learn from native speakers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎴</span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Practice Flashcards
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Smart spaced repetition
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Earn Rewards</h4>
                  <p className="text-gray-600 text-sm">
                    Convert EXP to RINDO tokens
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">🎁</span>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Redeem Vouchers
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Use at local merchant partners
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-96 bg-linear-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center text-7xl transform rotate-1">
              ✨
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Subscribe Our Newsletter
          </h2>
          <p className="text-gray-600 mb-8">
            Get updates on new languages, features, and exclusive rewards.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <Button className="bg-black hover:bg-gray-900 text-white px-6">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-serif font-bold text-white mb-4">
                RINDO
              </h3>
              <p className="text-sm leading-relaxed">
                Learn regional languages, earn real rewards on blockchain.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              © 2025 RINDO (Real Indo). Built with ❤️ for Bahasa Banjar
              preservation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { toast } from "sonner";

// Import ReactPlayer dynamically (client-side only)
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Video {
  id: number;
  lesson_id: number;
  title: string;
  video_url: string;
  transcript: TranscriptLine[];
  exp_reward: number;
  order_num: number;
}

interface TranscriptLine {
  time: string;
  text_id: string;
  text_banjar: string;
}

export default function VideoPage({
  params,
}: {
  params: Promise<{ lessonId: string; videoId: string }>;
}) {
  // Unwrap params Promise (Next.js 15)
  const { lessonId, videoId } = use(params);

  const router = useRouter();
  const { address } = useAccount();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);

  useEffect(() => {
    async function fetchVideo() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("videos")
          .select("*")
          .eq("id", videoId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setVideo(data);
      } catch (err: any) {
        console.error("Error fetching video:", err);
        setError(err.message || "Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  // Handle video completion and award EXP
  const handleVideoEnd = async () => {
    if (isCompleted) {
      toast.info("You've already completed this video!");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (isAwarding) {
      return; // Prevent double submission
    }

    try {
      setIsAwarding(true);

      // TODO: Call API route to award EXP (Prompt 19)
      // For now, just show success message
      toast.success(`🎉 +${video?.exp_reward} EXP earned!`);
      setIsCompleted(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error("Error awarding EXP:", error);
      toast.error("Failed to award EXP. Please try again.");
    } finally {
      setIsAwarding(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">
            Error loading video
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {error || "Video not found"}
          </p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Consistent with Dashboard */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 hover:text-purple-600"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </Button>
              <div className="hidden md:block h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-purple-600">RealIndo</h1>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-purple-700">
                +{video.exp_reward}
              </span>
              <span className="text-sm text-purple-600">EXP</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Gradient Banner */}
        <div className="bg-linear-to-r from-purple-500 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎬</span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  Video Lesson
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
              <p className="text-purple-50">
                Complete this video to earn{" "}
                <span className="font-bold text-yellow-300">
                  +{video.exp_reward} EXP
                </span>
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-5xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="aspect-video bg-black">
            <ReactPlayer
              src={video.video_url}
              controls
              width="100%"
              height="100%"
              onEnded={handleVideoEnd}
            />
          </div>
        </div>

        {/* Transcript Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transcript</h2>
              <p className="text-sm text-gray-500">Indonesia ↔ Bahasa Banjar</p>
            </div>
          </div>

          {video.transcript && video.transcript.length > 0 ? (
            <div className="space-y-4">
              {video.transcript.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-linear-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                        {line.time}
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        🇮🇩 Indonesia
                      </span>
                    </div>
                    <p className="text-base font-medium text-gray-900 leading-relaxed">
                      {line.text_id}
                    </p>
                  </div>
                  <div className="space-y-2 md:border-l md:border-purple-200 md:pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                        {line.time}
                      </span>
                      <span className="text-sm font-medium text-purple-600">
                        🗣️ Banjar
                      </span>
                    </div>
                    <p className="text-base font-bold text-purple-700 leading-relaxed">
                      {line.text_banjar}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No transcript available</p>
          )}
        </div>
      </main>
    </div>
  );
}

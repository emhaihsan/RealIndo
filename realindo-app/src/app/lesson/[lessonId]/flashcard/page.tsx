"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import {
  calculateNextReview,
  getDifficultyLabel,
  getDifficultyColor,
  type Difficulty,
} from "@/lib/utils/spaceRepetition";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface FlashcardData {
  id: number;
  lesson_id: number;
  front: string;
  back: string;
}

export default function FlashcardSessionPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = use(params);
  const router = useRouter();
  const { address } = useAccount();

  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Fetch flashcards on mount
  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("flashcards")
          .select("*")
          .eq("lesson_id", lessonId)
          .limit(5);

        if (error) throw error;

        if (!data || data.length === 0) {
          toast.error("No flashcards found for this lesson");
          router.push("/dashboard");
          return;
        }

        setFlashcards(data);
      } catch (err: any) {
        console.error("Error fetching flashcards:", err);
        toast.error("Failed to load flashcards");
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcards();
  }, [lessonId, router]);

  // Handle difficulty selection
  const handleDifficultySelect = async (difficulty: Difficulty) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (isRecording) return; // Prevent double submission

    try {
      setIsRecording(true);

      const currentCard = flashcards[currentCardIndex];
      const nextReviewDate = calculateNextReview(difficulty);

      // Call API route to record review (uses service role key to bypass RLS)
      const response = await fetch("/api/flashcard/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address,
          flashcardId: currentCard.id,
          difficulty,
          nextReviewAt: nextReviewDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error recording review:", data);
        toast.error("Failed to record review");
        return;
      }

      // Move to next card or complete session
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
        toast.success(`Review recorded: ${getDifficultyLabel(difficulty)}`);
      } else {
        // Session complete - award EXP
        await awardSessionEXP();
      }
    } catch (error: any) {
      console.error("Error handling difficulty:", error);
      toast.error("Failed to record review");
    } finally {
      setIsRecording(false);
    }
  };

  // Award +15 EXP for completing session
  const awardSessionEXP = async () => {
    try {
      const response = await fetch("/api/exp/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address,
          type: "flashcard_session",
          sourceId: parseInt(lessonId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to award EXP");
      }

      if (data.success) {
        setSessionComplete(true);
        toast.success("🎉 Flashcard session complete! +15 EXP earned!");
      }
    } catch (error: any) {
      console.error("Error awarding EXP:", error);
      toast.error("Session complete, but failed to award EXP");
      setSessionComplete(true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // Session complete state
  if (sessionComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Session Complete!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            You've reviewed {flashcards.length} flashcards
          </p>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-2xl font-bold text-green-700">+15 EXP Earned!</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <span className="text-lg">📚</span>
              <span className="font-bold text-purple-700">
                {currentCardIndex + 1} / {flashcards.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-purple-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flashcard Session
          </h1>
          <p className="text-gray-600">
            Review and rate each card based on how well you know it
          </p>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <Flashcard
            front={currentCard.front}
            back={currentCard.back}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>

        {/* Difficulty Buttons (show after flip) */}
        {isFlipped && (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 mb-4">
              How well did you know this card?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(["repeat", "hard", "good", "easy"] as Difficulty[]).map(
                (difficulty) => (
                  <Button
                    key={difficulty}
                    onClick={() => handleDifficultySelect(difficulty)}
                    disabled={isRecording}
                    className={`${getDifficultyColor(difficulty)} text-white py-6 text-lg font-semibold`}
                  >
                    {getDifficultyLabel(difficulty)}
                  </Button>
                )
              )}
            </div>
          </div>
        )}

        {/* Hint if not flipped */}
        {!isFlipped && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Click the card to reveal the answer
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

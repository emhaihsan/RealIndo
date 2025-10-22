"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface FlashcardProps {
  front: string; // Banjar text
  back: string; // Indonesia text
  onFlip?: () => void; // Optional callback when flipped
}

export function Flashcard({ front, back, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div
      onClick={handleFlip}
      className="h-80 cursor-pointer perspective"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-600"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side (Banjar) */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center space-y-4">
              <p className="text-sm font-medium text-orange-600">Banjar</p>
              <p className="text-4xl font-bold text-gray-900 wrap-break-word">
                {front}
              </p>
              <p className="text-xs text-gray-500 mt-4">Click to reveal</p>
            </div>
          </Card>
        </div>

        {/* Back Side (Indonesia) */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center space-y-4">
              <p className="text-sm font-medium text-green-600">Indonesia</p>
              <p className="text-4xl font-bold text-gray-900 wrap-break-word">
                {back}
              </p>
              <p className="text-xs text-gray-500 mt-4">Click to flip back</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

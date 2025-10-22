"use client";

import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function TestFlashcardPage() {
  const router = useRouter();

  const testCards = [
    { front: "Halu", back: "Halo" },
    { front: "Apa khabar?", back: "Apa kabar?" },
    { front: "Ulun", back: "Saya" },
    { front: "Ngaran", back: "Nama" },
    { front: "Handak", back: "Suka" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Flashcard Component Test
          </h1>
          <p className="text-gray-600">
            Click any card to flip. Test the animation and interaction.
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            ← Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testCards.map((card, index) => (
            <div key={index}>
              <Flashcard
                front={card.front}
                back={card.back}
                onFlip={() => console.log(`Card ${index + 1} flipped!`)}
              />
              <p className="text-center text-sm text-gray-500 mt-2">
                Card {index + 1}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Checklist</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Click card → should flip smoothly (0.6s animation)</li>
            <li>✅ Front shows Banjar text (orange background)</li>
            <li>✅ Back shows Indonesia text (green background)</li>
            <li>✅ Click again → should flip back to front</li>
            <li>✅ Animation is smooth (no jank)</li>
            <li>✅ Text is readable and centered</li>
            <li>✅ Works on mobile (responsive)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
